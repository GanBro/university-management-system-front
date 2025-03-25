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

export default {
  name: 'UniversityAdminInteraction',
  data() {
    return {
      loading: false,
      tableLoading: false,
      universityId: 1, // 假设当前管理员所属的高校 ID 为 1
      stats: {
        total: 54,
        pending: 12,
        avgResponseTime: 4.5,
        responseRate: 96.3
      },
      listQuery: {
        page: 1,
        limit: 10,
        status: 'pending',
        keyword: '',
        timeRange: []
      },
      list: [],
      total: 0,
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
  created() {
    this.fetchData()
  },
  methods: {
    async fetchData() {
      this.tableLoading = true
      try {
        // 实际项目中应该调用API获取数据
        // const { data } = await getInteractionList({
        //   universityId: this.universityId,
        //   ...this.listQuery
        // })

        // 模拟数据加载
        await new Promise(resolve => setTimeout(resolve, 500))

        // 模拟数据
        this.list = [
          {
            id: 1,
            universityId: 1,
            userId: 13,
            userName: '用户小王',
            title: '请问贵校计算机专业的就业方向有哪些？',
            content: '我对计算机专业很感兴趣，请问贵校计算机专业毕业生主要去向是哪里？大型互联网企业的比例有多少？',
            status: 'pending',
            createdAt: '2025-03-24 15:30:22',
            responseTime: null,
            viewCount: 12
          },
          {
            id: 2,
            universityId: 1,
            userId: 14,
            userName: '考生家长',
            title: '关于奖学金的问题',
            content: '请问贵校特等奖学金的具体申请条件是什么？每年多少人可以获得？',
            status: 'replied',
            createdAt: '2025-03-23 10:15:47',
            responseTime: '2025-03-23 14:26:35',
            viewCount: 18,
            replies: [
              {
                id: 1,
                interactionId: 2,
                userId: 35,
                userName: '北大管理员',
                content: '您好，我校特等奖学金每年评选20人，需要学年GPA在3.8以上，并且在科研或社会实践方面有突出表现。具体评选细则可以参考学校官网奖学金专栏。',
                isOfficial: true,
                createdAt: '2025-03-23 14:26:35'
              }
            ]
          },
          {
            id: 3,
            universityId: 1,
            userId: 15,
            userName: '未来大学生',
            title: '关于住宿问题',
            content: '请问宿舍是几人间？有独立卫浴吗？需要另外付费吗？',
            status: 'closed',
            createdAt: '2025-03-22 16:42:18',
            responseTime: '2025-03-22 17:30:45',
            viewCount: 25,
            replies: [
              {
                id: 2,
                interactionId: 3,
                userId: 35,
                userName: '北大管理员',
                content: '您好，我校本科生宿舍为4人间，配备空调、独立卫浴。住宿费用已包含在学费中，不需另外付费。',
                isOfficial: true,
                createdAt: '2025-03-22 17:30:45'
              },
              {
                id: 3,
                interactionId: 3,
                userId: 15,
                userName: '未来大学生',
                content: '谢谢回复！请问宿舍有饮水机和洗衣机吗？',
                isOfficial: false,
                createdAt: '2025-03-22 19:15:22'
              },
              {
                id: 4,
                interactionId: 3,
                userId: 35,
                userName: '北大管理员',
                content: '是的，每层楼都配有公共饮水机和洗衣房，洗衣房内有多台洗衣机和烘干机，使用校园卡即可付费使用。',
                isOfficial: true,
                createdAt: '2025-03-22 20:05:10'
              }
            ]
          }
        ]

        this.total = 54 // 模拟总数

      } catch (error) {
        console.error('获取互动列表失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.tableLoading = false
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

        // 实际项目中应该调用API获取详情
        // const { data } = await getInteractionDetail(row.id)

        // 模拟API调用，使用当前行数据
        if (this.list.find(item => item.id === row.id)) {
          this.currentInteraction = this.list.find(item => item.id === row.id)
        } else {
          // 如果列表中没有该数据，模拟加载
          await new Promise(resolve => setTimeout(resolve, 300))
          this.currentInteraction = row
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

        // 实际项目中应该调用API切换状态
        // if (row.status === 'closed') {
        //   await reopenInteraction(row.id)
        // } else {
        //   await closeInteraction(row.id)
        // }

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))

        this.$message.success(`已${action}`)
        this.fetchData()

      } catch (error) {
        if (error !== 'cancel') {
          console.error('操作失败:', error)
          this.$message.error('操作失败')
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

        // 实际项目中应该调用API删除
        // await deleteInteraction(row.id)

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))

        this.$message.success('删除成功')
        this.fetchData()

      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
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
          interactionId: this.currentInteraction.id,
          content: this.replyForm.content,
          isOfficial: this.replyForm.isOfficial,
          userId: 35 // 模拟当前用户ID
        }

        // 实际项目中应该调用API提交回复
        // await replyInteraction(replyData)

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))

        this.$message.success('回复成功')

        // 更新当前互动数据，添加一条回复
        const newReply = {
          id: Date.now(), // 模拟ID
          interactionId: this.currentInteraction.id,
          userId: 35,
          userName: '北大管理员', // 模拟用户名
          content: this.replyForm.content,
          isOfficial: this.replyForm.isOfficial,
          createdAt: new Date().toISOString()
        }

        if (!this.currentInteraction.replies) {
          this.currentInteraction.replies = []
        }

        this.currentInteraction.replies.push(newReply)
        this.currentInteraction.status = 'replied'
        this.currentInteraction.responseTime = new Date().toISOString()

        // 重置表单
        this.replyForm.content = ''

        // 刷新列表
        this.fetchData()

      } catch (error) {
        console.error('回复失败:', error)
        this.$message.error('回复失败')
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
