<!--src/views/university-admin/interaction/index.vue-->
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>互动咨询管理</span>
      </div>

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
        v-loading="tableLoading"
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
    </el-card>

    <!-- 互动详情对话框 -->
    <el-dialog
      title="互动详情"
      :visible.sync="detailDialogVisible"
      width="70%"
      custom-class="interaction-dialog"
    >
      <div v-if="currentInteraction" class="interaction-detail">
        <!-- 标题和元信息 -->
        <div class="interaction-header">
          <h3 class="interaction-title">{{ currentInteraction.title }}</h3>
          <div class="interaction-meta">
            <span class="meta-item">
              <i class="el-icon-user"></i>
              {{ currentInteraction.userName }}
            </span>
            <span class="meta-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(currentInteraction.createdAt) }}
            </span>
            <el-tag size="small" :type="getStatusType(currentInteraction.status)">
              {{ getStatusLabel(currentInteraction.status) }}
            </el-tag>
          </div>
        </div>

        <!-- 内容 -->
        <div class="interaction-content">
          <div class="content-text">{{ currentInteraction.content }}</div>
        </div>

        <!-- 对话列表 -->
        <div class="interaction-replies" v-if="currentInteraction.replies && currentInteraction.replies.length">
          <div class="reply-title">
            <i class="el-icon-chat-line-square"></i> 对话记录
          </div>
          <div
            v-for="(reply, index) in currentInteraction.replies"
            :key="index"
            class="reply-item"
            :class="{'reply-official': reply.isOfficial, 'reply-user': !reply.isOfficial}"
          >
            <div class="reply-header">
              <span class="reply-username">
                {{ reply.isOfficial ? reply.userName + ' (官方)' : reply.userName }}
              </span>
              <span class="reply-time">{{ formatDateTime(reply.createdAt) }}</span>
            </div>
            <div class="reply-content">{{ reply.content }}</div>
          </div>
        </div>

        <!-- 回复表单 -->
        <div class="reply-form">
          <div class="form-title">
            <i class="el-icon-edit"></i> 回复问题
          </div>
          <el-form ref="replyForm" :model="replyForm" :rules="replyRules">
            <el-form-item prop="content">
              <el-input
                v-model="replyForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入回复内容..."
              />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="replyForm.isOfficial">以官方身份回复</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitReply"
                :loading="replySubmitting"
              >提交回复</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'UniversityAdminInteraction',
  data() {
    return {
      loading: false,
      tableLoading: false,
      stats: {
        total: 0,
        pending: 0,
        avgResponseTime: 0,
        responseRate: 0
      },
      listQuery: {
        page: 1,
        limit: 10,
        status: 'pending',
        keyword: '',
        timeRange: []
      },
      total: 0,
      list: [],
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
      // 详情对话框
      detailDialogVisible: false,
      currentInteraction: null,
      // 回复表单
      replyForm: {
        content: '',
        isOfficial: true
      },
      replyRules: {
        content: [
          { required: true, message: '请输入回复内容', trigger: 'blur' },
          { min: 2, max: 500, message: '长度在 2 到 500 个字符', trigger: 'blur' }
        ]
      },
      replySubmitting: false
    }
  },
  computed: {
    ...mapState({
      interactionList: state => state.interaction.list,
      interactionTotal: state => state.interaction.total,
      listLoading: state => state.interaction.listLoading,
      detailLoading: state => state.interaction.detailLoading,
      currentInteractionStore: state => state.interaction.currentInteraction
    }),
    universityId() {
      // 从store中获取当前用户管理的大学ID
      // 在实际项目中，您应该从用户信息中获取这个值
      return this.$store.getters.universityId || 1
    }
  },
  created() {
    this.fetchData()
    this.fetchStats()
  },
  methods: {
    ...mapActions({
      getInteractionList: 'interaction/getList',
      getInteractionDetail: 'interaction/getDetail',
      closeInteractionAction: 'interaction/closeInteraction',
      reopenInteractionAction: 'interaction/reopenInteraction',
      deleteInteractionAction: 'interaction/deleteInteraction',
      replyInteractionAction: 'interaction/replyInteraction',
      getInteractionStats: 'interaction/getStats'
    }),

    async fetchData() {
      this.tableLoading = true
      try {
        // 构建查询参数
        const query = {
          ...this.listQuery,
          universityId: this.universityId
        }

        // 处理时间范围
        if (this.listQuery.timeRange && this.listQuery.timeRange.length === 2) {
          query.startTime = dayjs(this.listQuery.timeRange[0]).format('YYYY-MM-DD')
          query.endTime = dayjs(this.listQuery.timeRange[1]).format('YYYY-MM-DD')
        }
        delete query.timeRange

        const response = await this.getInteractionList(query)
        if (response && response.data) {
          this.list = response.data.records || []
          this.total = response.data.total || 0
        }
      } catch (error) {
        console.error('获取互动列表失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.tableLoading = false
      }
    },

    async fetchStats() {
      this.loading = true
      try {
        const response = await this.getInteractionStats({ universityId: this.universityId })
        if (response && response.data) {
          this.stats = response.data
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 格式化时间
    formatDateTime(time) {
      if (!time) return ''
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },

    // 根据状态筛选
    handleFilterByStatus(status) {
      this.listQuery.status = status
      this.fetchData()
    },

    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },

    // 重置筛选条件
    resetFilter() {
      this.$refs.searchForm.resetFields()
      this.listQuery = {
        page: 1,
        limit: 10,
        status: 'pending',
        keyword: '',
        timeRange: []
      }
      this.fetchData()
    },

    // 分页处理
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.fetchData()
    },

    handleCurrentChange(val) {
      this.listQuery.page = val
      this.fetchData()
    },

    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        replied: 'success',
        closed: 'info'
      }
      return typeMap[status] || ''
    },

    // 获取状态标签
    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭'
      }
      return labelMap[status] || '未知状态'
    },

    // 查看详情
    async showDetail(row) {
      try {
        this.detailDialogVisible = true
        const response = await this.getInteractionDetail(row.id)
        if (response && response.data) {
          this.currentInteraction = response.data
        }

        // 重置回复表单
        this.replyForm = {
          content: '',
          isOfficial: true
        }
      } catch (error) {
        console.error('获取详情失败:', error)
        this.$message.error('获取详情失败')
      }
    },

    // 切换互动状态
    async handleToggleStatus(row) {
      try {
        const action = row.status === 'closed' ? '开启' : '关闭'
        await this.$confirm(`确认${action}该互动？`, '提示', {
          type: 'warning'
        })

        if (row.status === 'closed') {
          await this.reopenInteractionAction(row.id)
        } else {
          await this.closeInteractionAction(row.id)
        }

        this.$message.success(`已${action}`)
        this.fetchData()
        this.fetchStats()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('操作失败:', error)
          this.$message.error('操作失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 删除互动
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该互动？此操作不可恢复', '警告', {
          type: 'warning',
          confirmButtonText: '确定删除',
          confirmButtonClass: 'el-button--danger'
        })

        await this.deleteInteractionAction(row.id)
        this.$message.success('删除成功')
        this.fetchData()
        this.fetchStats()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }
    },

    // 提交回复
    async submitReply() {
      try {
        await this.$refs.replyForm.validate()
        this.replySubmitting = true

        // 构造回复数据
        const replyData = {
          content: this.replyForm.content,
          isOfficial: this.replyForm.isOfficial,
          // 获取当前登录用户ID
          userId: this.$store.getters.userId || 35 // 如果无法获取，使用默认值
        }

        await this.replyInteractionAction({
          id: this.currentInteraction.id,
          data: replyData
        })

        this.$message.success('回复成功')

        // 更新当前互动状态
        this.currentInteraction.status = 'replied'

        // 重新获取详情以确保数据是最新的
        const response = await this.getInteractionDetail(this.currentInteraction.id)
        if (response && response.data) {
          this.currentInteraction = response.data
        }

        // 重置表单
        this.replyForm.content = ''

        // 刷新列表和统计数据
        this.fetchData()
        this.fetchStats()
      } catch (error) {
        console.error('回复失败:', error)
        this.$message.error('回复失败: ' + (error.message || '未知错误'))
      } finally {
        this.replySubmitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.data-overview {
  margin-bottom: 30px;

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
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

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;

  .el-button-group {
    margin-right: 20px;
  }

  .search-bar {
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    .el-form-item {
      margin-bottom: 0;
      margin-right: 18px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}

.pagination-container {
  margin-top: 20px;
  padding: 10px 0;
  text-align: right;
}

.interaction-dialog {
  .interaction-detail {
    padding: 0 20px;

    .interaction-header {
      margin-bottom: 20px;

      .interaction-title {
        font-size: 18px;
        margin-bottom: 10px;
      }

      .interaction-meta {
        display: flex;
        align-items: center;
        color: #909399;
        font-size: 14px;

        .meta-item {
          margin-right: 20px;
          display: flex;
          align-items: center;

          i {
            margin-right: 5px;
          }
        }
      }
    }

    .interaction-content {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;

      .content-text {
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    .interaction-replies {
      margin-bottom: 30px;

      .reply-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;

        i {
          margin-right: 5px;
        }
      }

      .reply-item {
        margin-bottom: 15px;
        padding: 15px;
        border-radius: 4px;

        &.reply-official {
          background: #ecf5ff;
          border-left: 4px solid #409EFF;
        }

        &.reply-user {
          background: #f0f9eb;
          border-left: 4px solid #67C23A;
        }

        .reply-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;

          .reply-username {
            font-weight: bold;
          }

          .reply-time {
            color: #909399;
            font-size: 13px;
          }
        }

        .reply-content {
          line-height: 1.6;
          white-space: pre-wrap;
        }
      }
    }

    .reply-form {
      .form-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;

        i {
          margin-right: 5px;
        }
      }
    }
  }
}
</style>
