// src/views/university/components/InteractionManagement.vue
<template>
  <div class="interaction-section">
    <div class="section-header">
      <h3>用户互动管理</h3>
      <el-button-group>
        <el-button
          type="primary"
          size="small"
          :plain="listQuery.status !== 'pending'"
          @click="handleFilterByStatus('pending')"
        >
          待处理
        </el-button>
        <el-button
          type="success"
          size="small"
          :plain="listQuery.status !== 'replied'"
          @click="handleFilterByStatus('replied')"
        >
          已回复
        </el-button>
        <el-button
          type="info"
          size="small"
          :plain="listQuery.status !== 'closed'"
          @click="handleFilterByStatus('closed')"
        >
          已关闭
        </el-button>
      </el-button-group>
    </div>

    <!-- 筛选区域 -->
    <el-form :inline="true" :model="listQuery" class="filter-form">
      <el-form-item label="类型">
        <el-select v-model="listQuery.type" placeholder="选择类型" clearable>
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="listQuery.keyword"
          placeholder="标题或内容"
          @keyup.enter.native="handleFilter"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleFilter">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表区域 -->
    <el-table
      v-loading="loading"
      :data="interactionList"
      border
      style="width: 100%"
    >
      <el-table-column label="ID" prop="id" width="80" align="center" />
      <el-table-column label="类型" width="100">
        <template slot-scope="{row}">
          <el-tag :type="getTypeStyle(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标题" show-overflow-tooltip>
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
          {{ row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template slot-scope="{row}">
          <el-button
            size="mini"
            type="primary"
            @click="showDetail(row)"
          >
            回复
          </el-button>
          <el-button
            v-if="row.status === 'pending' || row.status === 'replied'"
            size="mini"
            type="warning"
            @click="handleClose(row)"
          >
            关闭
          </el-button>
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
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="650px">
      <template v-if="currentInteraction">
        <div class="interaction-detail">
          <h4>{{ currentInteraction.title }}</h4>
          <div class="meta-info">
            <span>提交用户：{{ currentInteraction.userName }}</span>
            <span>提交时间：{{ currentInteraction.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            <span>状态：
              <el-tag :type="getStatusType(currentInteraction.status)" size="small">
                {{ getStatusLabel(currentInteraction.status) }}
              </el-tag>
            </span>
          </div>
          <div class="content">{{ currentInteraction.content }}</div>

          <!-- 回复列表 -->
          <div v-if="currentInteraction.replies && currentInteraction.replies.length" class="reply-list">
            <div v-for="reply in currentInteraction.replies" :key="reply.id" class="reply-item">
              <div class="reply-header">
                <span class="user-name">{{ reply.userName }}</span>
                <el-tag v-if="reply.isOfficial" size="mini" type="success">官方回复</el-tag>
                <span class="time">{{ reply.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
          </div>

          <!-- 回复表单 -->
          <div v-if="currentInteraction.status !== 'closed'" class="reply-form">
            <el-input
              type="textarea"
              v-model="replyContent"
              :rows="4"
              placeholder="请输入回复内容"
            />
          </div>
        </div>
      </template>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          v-if="currentInteraction && currentInteraction.status !== 'closed'"
          type="primary"
          @click="handleReply"
          :loading="submitLoading"
        >
          回复
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getInteractionList, getInteractionDetail, replyInteraction, closeInteraction } from '@/api/interaction'

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
      interactionList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        universityId: undefined,
        type: undefined,
        status: undefined,
        keyword: undefined
      },
      typeOptions: [
        { label: '在线咨询', value: 'consult' },
        { label: '意见反馈', value: 'feedback' },
        { label: '留言板', value: 'message' },
        { label: '校友交流', value: 'alumni' }
      ],
      dialogVisible: false,
      dialogTitle: '互动详情',
      currentInteraction: null,
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
    async fetchData() {
      this.loading = true
      try {
        const { data } = await getInteractionList(this.listQuery)
        this.interactionList = data.records
        this.total = data.total
      } catch (error) {
        console.error('Failed to fetch interaction list:', error)
        this.$message.error('获取互动列表失败')
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },
    resetFilter() {
      this.listQuery = {
        page: 1,
        limit: 10,
        universityId: this.universityId,
        type: undefined,
        status: undefined,
        keyword: undefined
      }
      this.fetchData()
    },
    handleFilterByStatus(status) {
      this.listQuery.status = status
      this.fetchData()
    },
    async showDetail(row) {
      try {
        const { data } = await getInteractionDetail(row.id)
        this.currentInteraction = data
        this.replyContent = ''
        this.dialogVisible = true
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
        await replyInteraction(this.currentInteraction.id, {
          content: this.replyContent,
          isOfficial: true
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
    async handleClose(row) {
      try {
        await this.$confirm('确认关闭该互动？', '提示', {
          type: 'warning'
        })
        await closeInteraction(row.id)
        this.$message.success('已关闭')
        this.fetchData()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Failed to close interaction:', error)
          this.$message.error('操作失败')
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
    getTypeStyle(type) {
      const styleMap = {
        consult: 'primary',
        feedback: 'success',
        message: 'warning',
        alumni: 'info'
      }
      return styleMap[type] || ''
    },
    getTypeLabel(type) {
      const labelMap = {
        consult: '在线咨询',
        feedback: '意见反馈',
        message: '留言板',
        alumni: '校友交流'
      }
      return labelMap[type] || type
    },
    getStatusType(status) {
      const typeMap = {
        pending: '',
        replied: 'success',
        closed: 'info'
      }
      return typeMap[status]
    },
    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭'
      }
      return labelMap[status]
    }
  }
}
</script>

<style lang="scss" scoped>
.interaction-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
    }
  }

  .filter-form {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }

  .interaction-detail {
    h4 {
      margin: 0 0 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .meta-info {
      margin-bottom: 15px;
      color: #666;
      span {
        margin-right: 20px;
      }
    }

    .content {
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .reply-list {
      margin: 20px 0;

      .reply-item {
        padding: 10px;
        border-radius: 4px;
        background: #f5f7fa;
        margin-bottom: 10px;

        .reply-header {
          margin-bottom: 8px;
          .user-name {
            font-weight: bold;
            margin-right: 10px;
          }
          .time {
            color: #999;
            font-size: 12px;
            margin-left: 10px;
          }
        }
      }
    }

    .reply-form {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  }
}
</style>
