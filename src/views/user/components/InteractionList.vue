<template>
  <div class="interaction-list-section">
    <!-- 互动入口按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="handleCreate">新建互动</el-button>
    </div>

    <!-- 我的互动列表 -->
    <div class="my-interactions">
      <h3>我的互动记录</h3>
      <el-table
        v-loading="loading"
        :data="interactionList"
        border
        style="width: 100%"
      >
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160" align="center">
          <template slot-scope="{row}">
            {{ row.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{row}">
            <el-button
              type="text"
              @click="showDetail(row)"
            >
              查看详情
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
          :page-sizes="[10, 20, 30]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next"
          :total="total"
        />
      </div>
    </div>

    <!-- 创建互动对话框 -->
    <el-dialog
      title="新建互动"
      :visible.sync="createDialogVisible"
      width="600px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="4"
            placeholder="请详细描述您的问题或想法"
          />
        </el-form-item>
        <el-form-item label="是否公开" prop="isPublic">
          <el-switch v-model="form.isPublic" />
          <span class="tip">公开的内容其他用户可见</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      title="详情查看"
      :visible.sync="detailDialogVisible"
      width="650px"
    >
      <div v-if="currentInteraction" class="interaction-detail">
        <div class="detail-header">
          <h4>{{ currentInteraction.title }}</h4>
          <div class="meta">
            <el-tag :type="getStatusType(currentInteraction.status)">
              {{ getStatusLabel(currentInteraction.status) }}
            </el-tag>
            <span class="time">
              {{ currentInteraction.createdAt | parseTime('{y}-{m}-{d} {h}:{i}') }}
            </span>
          </div>
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

        <!-- 追加回复 -->
        <div v-if="currentInteraction.status !== 'closed'" class="add-reply">
          <el-input
            type="textarea"
            v-model="replyContent"
            :rows="3"
            placeholder="您可以继续追加回复..."
          />
          <div class="reply-actions">
            <el-button type="primary" size="small" @click="handleAddReply" :loading="replyLoading">
              追加回复
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getInteractionList,
  getInteractionDetail,
  createInteraction,
  replyInteraction
} from '@/api/interaction'
import { mapGetters } from 'vuex'

export default {
  name: 'InteractionList',
  data() {
    return {
      loading: false,
      interactionList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        userId: undefined
      },
      createDialogVisible: false,
      detailDialogVisible: false,
      form: this.getInitialForm(),
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      },
      currentInteraction: null,
      replyContent: '',
      submitLoading: false,
      replyLoading: false
    }
  },
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  created() {
    this.listQuery.userId = this.userId
    this.fetchData()
  },
  methods: {
    getInitialForm() {
      return {
        title: '',
        content: '',
        isPublic: true,
        userId: this.userId
      }
    },
    async fetchData() {
      this.loading = true
      try {
        const { data } = await getInteractionList(this.listQuery)
        this.interactionList = data.records
        this.total = data.total
      } catch (error) {
        console.error('Failed to fetch interaction list:', error)
        this.$message.error('获取列表失败')
      } finally {
        this.loading = false
      }
    },
    handleCreate() {
      this.form = this.getInitialForm()
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true
        await createInteraction(this.form)
        this.$message.success('提交成功')
        this.createDialogVisible = false
        this.fetchData()
      } catch (error) {
        console.error('Failed to create:', error)
        this.$message.error('提交失败')
      } finally {
        this.submitLoading = false
      }
    },
    async showDetail(row) {
      try {
        const { data } = await getInteractionDetail(row.id)
        this.currentInteraction = data
        this.replyContent = ''
        this.detailDialogVisible = true
      } catch (error) {
        console.error('Failed to get detail:', error)
        this.$message.error('获取详情失败')
      }
    },
    async handleAddReply() {
      if (!this.replyContent.trim()) {
        this.$message.warning('请输入回复内容')
        return
      }

      this.replyLoading = true
      try {
        await replyInteraction(this.currentInteraction.id, {
          content: this.replyContent,
          isOfficial: false,
          userId: this.userId
        })
        this.$message.success('回复成功')
        const { data } = await getInteractionDetail(this.currentInteraction.id)
        this.currentInteraction = data
        this.replyContent = ''
        this.fetchData()
      } catch (error) {
        console.error('Failed to reply:', error)
        this.$message.error('回复失败')
      } finally {
        this.replyLoading = false
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
