<!-- src/views/admin/university/components/InteractionManagement.vue -->
<template>
  <div class="interaction-management">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon">
            <i class="el-icon-chat-dot-round"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total || 0 }}</div>
            <div class="stat-label">总互动数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon">
            <i class="el-icon-message"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending || 0 }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon">
            <i class="el-icon-timer"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.avgResponseTime || 0 }}小时</div>
            <div class="stat-label">平均响应时间</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon">
            <i class="el-icon-data-line"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.responseRate || 0 }}%</div>
            <div class="stat-label">回复率</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 状态切换按钮组和搜索栏 -->
    <div class="section-header">
      <el-button-group>
        <el-button
          type="primary"
          size="small"
          :plain="listQuery.status !== 'pending'"
          @click="handleFilterByStatus('pending')"
        >待处理</el-button>
        <el-button
          type="success"
          size="small"
          :plain="listQuery.status !== 'replied'"
          @click="handleFilterByStatus('replied')"
        >已回复</el-button>
        <el-button
          type="info"
          size="small"
          :plain="listQuery.status !== 'closed'"
          @click="handleFilterByStatus('closed')"
        >已关闭</el-button>
      </el-button-group>

      <el-form :inline="true" :model="listQuery" ref="searchForm" class="search-bar">
        <el-form-item label="关键词">
          <el-input
            v-model="listQuery.keyword"
            placeholder="标题或内容"
            @keyup.enter.native="handleFilter"
          />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="listQuery.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 互动列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      border
      style="width: 100%"
    >
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="标题" min-width="200" show-overflow-tooltip>
        <template slot-scope="{row}">
          <el-link type="primary" @click.stop="showDetail(row)">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="提交用户" prop="userName" width="120" />
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="提交时间" width="160" align="center">
        <template slot-scope="{row}">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="回复时间" width="160" align="center">
        <template slot-scope="{row}">
          {{ row.responseTime ? formatDateTime(row.responseTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="回复人" width="120" prop="replierName" />
      <el-table-column label="操作" width="230" align="center" fixed="right">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            type="primary"
            @click.stop="showDetail(row)"
          >回复</el-button>
          <el-button
            size="mini"
            :type="row.status === 'closed' ? 'success' : 'warning'"
            @click.stop="handleToggleStatus(row)"
          >{{ row.status === 'closed' ? '开启' : '关闭' }}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click.stop="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="listQuery.page"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="listQuery.limit"
        layout="total, sizes, prev, pager, next"
        :total="total"
      />
    </div>

    <!-- 使用共享的互动详情对话框组件 -->
    <InteractionDetailDialog
      :visible.sync="dialogVisible"
      :current-interaction="currentItem"
      :is-admin="true"
      @reply="handleReply"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs';
import InteractionDetailDialog from '@/components/InteractionDetailDialog';

export default {
  name: 'InteractionManagement',
  components: {
    InteractionDetailDialog
  },
  props: {
    universityId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        universityId: undefined,
        status: undefined,
        keyword: undefined,
        timeRange: []
      },
      stats: {
        total: 0,
        pending: 0,
        avgResponseTime: 0,
        responseRate: 0
      },
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      },
      dialogVisible: false,
      currentItem: null
    };
  },
  watch: {
    universityId: {
      handler(val) {
        if (val) {
          this.listQuery.universityId = Number(val);
          this.fetchData();
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDateTime(time) {
      if (!time) return '';
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
    },

    async fetchData() {
      this.loading = true;
      try {
        // 并行请求列表和统计数据
        const [listResult, statsResult] = await Promise.all([
          this.$store.dispatch('interaction/getList', {
            ...this.listQuery,
            startTime: this.listQuery.timeRange?.[0],
            endTime: this.listQuery.timeRange?.[1]
          }),
          this.$store.dispatch('interaction/getStats', {
            universityId: this.universityId
          })
        ]);

        this.list = listResult.data.records || [];
        this.total = listResult.data.total || 0;

        // 更新统计数据
        this.stats = statsResult.data || {
          total: 0,
          pending: 0,
          avgResponseTime: 0,
          responseRate: 0
        };
      } catch (error) {
        console.error('Failed to fetch data:', error);
        this.$message.error('获取数据失败');
      } finally {
        this.loading = false;
      }
    },

    handleFilter() {
      this.listQuery.page = 1;
      this.fetchData();
    },

    resetFilter() {
      this.$refs.searchForm.resetFields();
      this.listQuery = {
        page: 1,
        limit: 10,
        universityId: this.universityId,
        status: undefined,
        keyword: undefined,
        timeRange: []
      };
      this.fetchData();
    },

    handleFilterByStatus(status) {
      this.listQuery.status = status;
      this.fetchData();
    },

    async showDetail(row) {
      try {
        const result = await this.$store.dispatch('interaction/getDetail', row.id);
        if (result.data) {
          this.currentItem = result.data;
          this.dialogVisible = true;
        } else {
          this.$message.error('获取详情失败：数据为空');
        }
      } catch (error) {
        console.error('Failed to get interaction detail:', error);
        this.$message.error('获取详情失败');
      }
    },

    async handleReply({ content, isOfficial }) {
      try {
        await this.$store.dispatch('interaction/replyInteraction', {
          id: this.currentItem.id,
          data: {
            content,
            isOfficial,
            userId: this.$store.state.user.userId
          }
        });
        this.$message.success('回复成功');
        this.dialogVisible = false;
        this.fetchData();
      } catch (error) {
        console.error('Failed to reply:', error);
        this.$message.error('回复失败');
      }
    },

    async handleToggleStatus(row) {
      try {
        const action = row.status === 'closed' ? '开启' : '关闭';
        await this.$confirm(`确认${action}该互动？`, '提示', {
          type: 'warning'
        });

        if (row.status === 'closed') {
          await this.$store.dispatch('interaction/reopenInteraction', row.id);
        } else {
          await this.$store.dispatch('interaction/closeInteraction', row.id);
        }

        this.$message.success(`已${action}`);
        this.fetchData();
      } catch (error) {
        if (error !== 'cancel') {
          console.error(`Failed to ${row.status === 'closed' ? 'reopen' : 'close'} interaction:`, error);
          this.$message.error('操作失败');
        }
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该互动？此操作不可恢复', '警告', {
          type: 'warning',
          confirmButtonText: '确定删除',
          confirmButtonClass: 'el-button--danger'
        });

        await this.$store.dispatch('interaction/deleteInteraction', row.id);
        this.$message.success('删除成功');
        this.fetchData();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete interaction:', error);
          this.$message.error('删除失败');
        }
      }
    },

    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.fetchData();
    },

    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        replied: 'success',
        closed: 'info'
      };
      return typeMap[status] || '';
    },

    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭'
      };
      return labelMap[status] || '未知状态';
    }
  }
};
</script>

<style lang="scss" scoped>
.interaction-management {
  // 数据概览卡片样式
  .data-overview {
    margin-bottom: 30px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      height: 100%;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        background: rgba(64, 158, 255, 0.1);

        i {
          font-size: 24px;
          color: #409EFF;
        }

        // 不同卡片不同的图标颜色
        &.icon-total {
          background: rgba(64, 158, 255, 0.1);
          i { color: #409EFF; }
        }

        &.icon-pending {
          background: rgba(230, 162, 60, 0.1);
          i { color: #E6A23C; }
        }

        &.icon-time {
          background: rgba(103, 194, 58, 0.1);
          i { color: #67C23A; }
        }

        &.icon-rate {
          background: rgba(144, 147, 153, 0.1);
          i { color: #909399; }
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  // 头部区域样式
  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .el-button-group {
      margin-right: 20px;
    }

    .search-bar {
      flex: 1;
      display: flex;
      align-items: center;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 18px;

        &:last-child {
          margin-right: 0;
        }
      }

      .el-input {
        width: 220px;
      }

      .el-date-editor {
        width: 360px;
      }
    }
  }

  // 表格样式优化
  .el-table {
    margin-bottom: 20px;

    // 表格内链接样式
    .el-link {
      font-weight: normal;

      &:hover {
        text-decoration: underline;
      }
    }

    // 状态标签样式
    .el-tag {
      border-radius: 12px;
      padding: 0 12px;
    }

    // 操作按钮组样式
    .operation-group {
      .el-button {
        padding: 5px 8px;
        margin-left: 0;
        margin-right: 8px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  // 分页器样式
  .pagination-container {
    margin-top: 20px;
    padding: 10px 0;
    text-align: right;
  }

  // 响应式布局适配
  @media screen and (max-width: 1200px) {
    .search-bar {
      .el-date-editor {
        width: 260px;
      }
    }
  }

  @media screen and (max-width: 768px) {
    .data-overview {
      .el-col {
        margin-bottom: 15px;
      }
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      .el-button-group {
        width: 100%;
        display: flex;
        .el-button {
          flex: 1;
        }
      }

      .search-bar {
        width: 100%;

        .el-form-item {
          margin-bottom: 15px;
          margin-right: 0;
          width: 100%;
        }

        .el-input,
        .el-date-editor {
          width: 100%;
        }
      }
    }

    .el-table {
      .operation-group {
        .el-button {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
