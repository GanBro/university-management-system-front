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

    <!-- 状态切换按钮组 -->
    <div class="section-header">
      <h3>互动管理</h3>
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
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-bar">
      <el-form :inline="true" :model="listQuery" ref="searchForm">
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
          <el-link type="primary" @click="showDetail(row)">{{ row.title }}</el-link>
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
            @click="showDetail(row)"
          >回复</el-button>
          <el-button
            size="mini"
            :type="row.status === 'closed' ? 'success' : 'warning'"
            @click="handleToggleStatus(row)"
          >{{ row.status === 'closed' ? '开启' : '关闭' }}</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row)"
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

    <!-- 详情对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      width="750px"
      class="interaction-detail-dialog"
      :title="null"
      append-to-body
    >
      <div v-if="currentItem" class="interaction-detail">
        <!-- 标题栏 -->
        <div class="detail-header">
          <div class="header-main">
            <h3>{{ currentItem.title }}</h3>
            <div class="header-meta">
              <el-tag
                :type="getStatusType(currentItem.status)"
                size="small"
              >
                {{ getStatusLabel(currentItem.status) }}
              </el-tag>
            </div>
          </div>
          <div class="header-info">
            <span class="info-item">
              <i class="el-icon-user"></i>
              {{ currentItem.userName || '匿名用户' }}
            </span>
            <span class="info-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(currentItem.createdAt) }}
            </span>
            <span class="info-item">
              <i class="el-icon-view"></i>
              {{ currentItem.viewCount || 0 }} 次浏览
            </span>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="detail-content">
          <div class="content-box">
            {{ currentItem.content }}
          </div>
        </div>

        <!-- 回复列表 -->
        <div class="reply-section">
          <div class="reply-header">
            <span class="reply-title">
              <i class="el-icon-chat-dot-round"></i>
              回复记录 ({{ currentItem.replies ? currentItem.replies.length : 0 }})
            </span>
          </div>

          <div v-if="currentItem.replies && currentItem.replies.length" class="reply-list">
            <div
              v-for="reply in currentItem.replies"
              :key="reply.id"
              class="reply-item"
              :class="{ 'official-reply': reply.isOfficial }"
            >
              <div class="reply-item-header">
                <div class="user-info">
                  <el-avatar :size="32" icon="el-icon-user-solid"></el-avatar>
                  <span class="username">{{ reply.userName }}</span>
                  <el-tag
                    v-if="reply.isOfficial"
                    type="success"
                    size="mini"
                    effect="dark"
                  >官方回复</el-tag>
                </div>
                <span class="reply-time">
                  {{ formatDateTime(reply.createdAt) }}
                </span>
              </div>
              <div class="reply-content">
                {{ reply.content }}
              </div>
            </div>
          </div>
          <div v-else class="no-reply">
            <el-empty description="暂无回复" :image-size="60"></el-empty>
          </div>

          <!-- 回复输入框 -->
          <div v-if="currentItem.status !== 'closed'" class="reply-form">
            <el-input
              v-model="replyContent"
              type="textarea"
              :rows="3"
              placeholder="请输入回复内容..."
              :maxlength="500"
              show-word-limit
            ></el-input>
            <div class="form-actions">
              <el-button
                type="primary"
                :loading="submitLoading"
                @click="handleReply"
              >提交回复</el-button>
            </div>
          </div>
          <div v-else class="interaction-closed">
            <el-alert
              title="该互动已关闭，无法继续回复"
              type="warning"
              :closable="false"
              center
              show-icon
            ></el-alert>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'InteractionManagement',
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
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      dialogVisible: false,
      currentItem: null,
      replyContent: '',
      submitLoading: false
    }
  },
  watch: {
    universityId: {
      handler(val) {
        if (val) {
          this.listQuery.universityId = Number(val)
          this.fetchData()
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDateTime(time) {
      if (!time) return ''
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
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

    calculateAvgResponseTime() {
      const repliedItems = this.list.filter(item => item.responseTime)
      if (!repliedItems.length) return 0

      const totalHours = repliedItems.reduce((sum, item) => {
        const responseTime = new Date(item.responseTime)
        const createTime = new Date(item.createdAt)
        return sum + (responseTime - createTime) / (1000 * 60 * 60)
      }, 0)

      return Math.round(totalHours / repliedItems.length)
    },

    calculateResponseRate() {
      if (!this.list.length) return 0
      const repliedCount = this.list.filter(item => item.status === 'replied').length
      return Math.round((repliedCount / this.list.length) * 100)
    },

    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },

    resetFilter() {
      this.$refs.searchForm.resetFields()
      this.listQuery = {
        page: 1,
        limit: 10,
        universityId: this.universityId,
        status: undefined,
        keyword: undefined,
        timeRange: []
      }
      this.fetchData()
    },

    handleFilterByStatus(status) {
      this.listQuery.status = status
      this.fetchData()
    },

    async showDetail(row) {
      try {
        const result = await this.$store.dispatch('interaction/getDetail', row.id)
        if (result.data) {
          this.currentItem = result.data
          this.replyContent = ''
          this.dialogVisible = true
        } else {
          this.$message.error('获取详情失败：数据为空')
        }
      } catch (error) {
        console.error('Failed to get interaction detail:', error)
        this.$message.error('获取详情失败')
      }
    },

    async handleReply() {
      if (!this.replyContent.trim()) {
        this.$message.warning('请输入回复内容')
        return
      }

      this.submitLoading = true
      try {
        await this.$store.dispatch('interaction/replyInteraction', {
          id: this.currentItem.id,
          data: {
            content: this.replyContent.trim(),
            isOfficial: true,
            userId: this.$store.state.user.id
          }
        })
        this.$message.success('回复成功')
        this.dialogVisible = false
        this.fetchData()
      } catch (error) {
        console.error('Failed to reply:', error)
        this.$message.error('回复失败')
      } finally {
        this.submitLoading = false
      }
    },

    async handleToggleStatus(row) {
      try {
        const action = row.status === 'closed' ? '开启' : '关闭'
        await this.$confirm(`确认${action}该互动？`, '提示', {
          type: 'warning'
        })

        if (row.status === 'closed') {
          await this.$store.dispatch('interaction/reopenInteraction', row.id)
        } else {
          await this.$store.dispatch('interaction/closeInteraction', row.id)
        }

        this.$message.success(`已${action}`)
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error(`Failed to ${row.status === 'closed' ? 'reopen' : 'close'} interaction:`, error)
          this.$message.error('操作失败')
        }
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该互动？此操作不可恢复', '警告', {
          type: 'warning',
          confirmButtonText: '确定删除',
          confirmButtonClass: 'el-button--danger'
        })

        await this.$store.dispatch('interaction/deleteInteraction', row.id)
        this.$message.success('删除成功')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to delete interaction:', error)
          this.$message.error('删除失败')
        }
      }
    },

    handleSizeChange(val) {
      this.listQuery.limit = val
      this.fetchData()
    },

    handleCurrentChange(val) {
      this.listQuery.page = val
      this.fetchData()
    },

    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        replied: 'success',
        closed: 'info'
      }
      return typeMap[status] || ''
    },

    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭'
      }
      return labelMap[status] || '未知状态'
    }
  }
}
</script>

<style lang="scss" scoped>
.interaction-management {
  .data-overview {
    margin-bottom: 30px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;

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
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
    }
  }

  .search-bar {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .interaction-detail-dialog {
    :deep(.el-dialog__header) {
      padding: 0;
    }

    :deep(.el-dialog__body) {
      padding: 0;
    }
  }

  .interaction-detail {
    .detail-header {
      padding: 24px;
      background-color: #fff;
      border-bottom: 1px solid #ebeef5;

      .header-main {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          font-size: 20px;
          line-height: 28px;
          color: #1f2f3d;
          flex: 1;
          padding-right: 20px;
        }
      }

      .header-info {
        display: flex;
        align-items: center;
        color: #909399;
        font-size: 13px;

        .info-item {
          margin-right: 20px;
          display: flex;
          align-items: center;

          i {
            margin-right: 4px;
          }
        }
      }
    }

    .detail-content {
      padding: 24px;
      background-color: #fff;
      border-bottom: 1px solid #ebeef5;

      .content-box {
        line-height: 1.8;
        color: #303133;
        font-size: 14px;
        white-space: pre-wrap;
      }
    }

    .reply-section {
      padding: 24px;
      background: #f8f9fb;

      .reply-header {
        margin-bottom: 20px;

        .reply-title {
          font-size: 16px;
          font-weight: 500;
          color: #1f2f3d;
          display: flex;
          align-items: center;

          i {
            margin-right: 8px;
            color: #409EFF;
          }
        }
      }

      .reply-list {
        .reply-item {
          background: #fff;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

          &.official-reply {
            background: #ecf5ff;
            border: 1px solid #d9ecff;
          }

          .reply-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .user-info {
              display: flex;
              align-items: center;

              .username {
                margin: 0 10px;
                font-weight: 500;
                color: #303133;
              }
            }

            .reply-time {
              color: #909399;
              font-size: 13px;
            }
          }

          .reply-content {
            color: #303133;
            line-height: 1.6;
            white-space: pre-wrap;
          }
        }
      }

      .no-reply {
        padding: 32px 0;
      }

      .reply-form {
        margin-top: 24px;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

        .form-actions {
          margin-top: 16px;
          text-align: right;
        }
      }

      .interaction-closed {
        margin-top: 24px;
      }
    }
  }
}

::v-deep(.el-tag--dark) {
  margin-left: 8px;
}
</style>
