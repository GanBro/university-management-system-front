<!-- src/components/InteractionDetailDialog/index.vue -->
<template>
  <el-dialog
    :visible.sync="visible"
    width="750px"
    class="interaction-detail-dialog"
    :title="null"
    append-to-body
  >
    <div v-if="currentInteraction" class="interaction-detail">
      <!-- 标题栏 -->
      <div class="detail-header">
        <div class="header-main">
          <h3>{{ currentInteraction.title }}</h3>
          <div class="header-meta">
            <el-tag :type="getStatusType(currentInteraction.status)" size="small">
              {{ getStatusLabel(currentInteraction.status) }}
            </el-tag>
          </div>
        </div>
        <div class="header-info">
          <span class="info-item">
            <ImageHandler
              :src="currentInteraction.avatar"
              :size="24"
            />
            <span class="ml-2">{{ currentInteraction.userName || '匿名用户' }}</span>
          </span>
          <span class="info-item">
            <i class="el-icon-time"></i>
            {{ formatTime(currentInteraction.created_at) }}
          </span>
          <span class="info-item">
            <i class="el-icon-view"></i>
            {{ currentInteraction.viewCount || 0 }} 次浏览
          </span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="detail-content">
        <div class="content-box">
          {{ currentInteraction.content }}
        </div>
      </div>

      <!-- 回复列表 -->
      <div class="reply-section">
        <div class="reply-header">
          <span class="reply-title">
            <i class="el-icon-chat-dot-round"></i>
            {{ isQuestioner ? '跟进记录' : '回复记录' }}
            ({{ currentInteraction.replies ? currentInteraction.replies.length : 0 }})
          </span>
        </div>

        <div v-if="currentInteraction.replies && currentInteraction.replies.length" class="reply-list">
          <div
            v-for="reply in currentInteraction.replies"
            :key="reply.id"
            class="reply-item"
            :class="{
              'official-reply': reply.isOfficial,
              'questioner-reply': isReplyFromQuestioner(reply)
            }"
          >
            <div class="reply-item-header">
              <div class="user-info">
                <ImageHandler
                  :src="reply.avatar"
                  :size="32"
                />
                <span class="username">{{ reply.userName || '未知用户' }}</span>
                <template v-if="reply.isOfficial">
                  <el-tag
                    type="success"
                    size="mini"
                    effect="dark"
                  >官方回复</el-tag>
                </template>
                <template v-else-if="isReplyFromQuestioner(reply)">
                  <el-tag
                    type="warning"
                    size="mini"
                    effect="dark"
                  >提问者</el-tag>
                </template>
                <template v-else>
                  <el-tag
                    type="info"
                    size="mini"
                    effect="dark"
                  >普通回复</el-tag>
                </template>
              </div>
              <span class="reply-time">
                {{ formatTime(reply.created_at) }}
              </span>
            </div>
            <div class="reply-content">
              {{ reply.content }}
            </div>
          </div>
        </div>
        <div v-else class="no-reply">
          <el-empty :description="isQuestioner ? '暂无跟进内容' : '暂无回复'" :image-size="60"></el-empty>
        </div>

        <!-- 回复输入框 -->
        <div v-if="currentInteraction.status !== 'closed'" class="reply-form">
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="3"
            :placeholder="getInputPlaceholder"
            :maxlength="500"
            show-word-limit
          ></el-input>
          <div class="form-actions">
            <el-button
              type="primary"
              :loading="submitLoading"
              @click="handleReply"
            >{{ getSubmitButtonText }}</el-button>
          </div>
        </div>
        <div v-else class="interaction-closed">
          <el-alert
            :title="isQuestioner ? '该咨询已关闭，无法继续补充' : '该互动已关闭，无法继续回复'"
            type="warning"
            :closable="false"
            center
            show-icon
          ></el-alert>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import moment from 'moment'
import { mapState } from 'vuex'
import ImageHandler from '@/components/ImageHandler'

export default {
  name: 'InteractionDetailDialog',
  components: {
    ImageHandler
  },
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    currentInteraction: {
      type: Object,
      default: () => ({
        title: '',
        content: '',
        status: '',
        userId: null,
        userName: '',
        avatar: '',
        viewCount: 0,
        created_at: null,
        replies: []
      })
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      replyContent: '',
      submitLoading: false,
    }
  },
  computed: {
    ...mapState({
      currentUser: state => state.user.name
    }),
    isQuestioner() {
      const currentUserId = this.$store.state.user.id
      return currentUserId && this.currentInteraction?.userId &&
        String(currentUserId) === String(this.currentInteraction.userId)
    },
    getInputPlaceholder() {
      if (this.isAdmin) return '请输入官方回复内容...'
      if (this.isQuestioner) return '请输入补充说明...'
      return '请输入回复内容...'
    },
    getSubmitButtonText() {
      if (this.isAdmin) return '官方回复'
      if (this.isQuestioner) return '补充说明'
      return '提交回复'
    }
  },
  methods: {
    isReplyFromQuestioner(reply) {
      return this.currentInteraction?.userId &&
        String(reply.userId) === String(this.currentInteraction.userId)
    },
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm')
    },
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        replied: 'success',
        closed: 'info',
      }
      return typeMap[status] || ''
    },
    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭',
      }
      return labelMap[status] || '未知状态'
    },
    async handleReply() {
      const currentUserId = this.$store.state.user.id
      if (!currentUserId) {
        this.$message.warning('请先登录')
        this.$router.push({
          path: '/login',
          query: { redirect: this.$route.fullPath }
        })
        return
      }

      if (!this.replyContent.trim()) {
        this.$message.warning(
          this.isQuestioner ? '请输入补充说明内容'
            : this.isAdmin ? '请输入官方回复内容'
              : '请输入回复内容'
        )
        return
      }

      this.submitLoading = true
      try {
        await this.$emit('reply', {
          content: this.replyContent.trim(),
          isOfficial: this.isAdmin,
          userId: currentUserId
        })
        this.$message.success(
          this.isQuestioner ? '补充说明已提交'
            : this.isAdmin ? '官方回复已提交'
              : '回复成功'
        )
        this.replyContent = ''
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error(
          this.isQuestioner ? '补充说明提交失败'
            : this.isAdmin ? '官方回复提交失败'
              : '回复失败'
        )
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.interaction-detail-dialog {
  ::v-deep(.el-dialog__header) {
    padding: 0;
  }

  ::v-deep(.el-dialog__body) {
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

        .ml-2 {
          margin-left: 8px;
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

        &.questioner-reply {
          background: #fef3c7;
          border: 1px solid #fcd34d;
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

        .el-button + .el-button {
          margin-left: 12px;
        }
      }
    }

    .interaction-closed {
      margin-top: 24px;
    }
  }
}

::v-deep(.el-tag--dark) {
  margin-left: 8px;
}
</style>
