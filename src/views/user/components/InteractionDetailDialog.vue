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
            <i class="el-icon-user"></i>
            {{ formatUser(currentInteraction.user_id) || '匿名用户' }}
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
            回复记录 ({{ currentInteraction.replies ? currentInteraction.replies.length : 0 }})
          </span>
        </div>

        <div v-if="currentInteraction.replies && currentInteraction.replies.length" class="reply-list">
          <div
            v-for="reply in currentInteraction.replies"
            :key="reply.id"
            class="reply-item"
            :class="{ 'official-reply': reply.isOfficial }"
          >
            <div class="reply-item-header">
              <div class="user-info">
                <el-avatar :size="32" icon="el-icon-user-solid"></el-avatar>
                <span class="username">{{ formatUser(reply.user_id) }}</span>
                <el-tag
                  v-if="reply.isOfficial"
                  type="success"
                  size="mini"
                  effect="dark"
                >官方回复</el-tag>
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
          <el-empty description="暂无回复" :image-size="60"></el-empty>
        </div>

        <!-- 回复输入框 -->
        <div v-if="currentInteraction.status !== 'closed'" class="reply-form">
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
</template>

<script>
import moment from 'moment';

export default {
  name: 'InteractionDetailDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    currentInteraction: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      replyContent: '',
      submitLoading: false,
    };
  },
  methods: {
    formatUser(userId) {
      // TODO: 根据用户ID获取用户名，可以考虑使用 Vuex 存储用户信息
      return userId;
    },
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm');
    },
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        replied: 'success',
        closed: 'info',
      };
      return typeMap[status] || '';
    },
    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭',
      };
      return labelMap[status] || '未知状态';
    },
    async handleReply() {
      if (!this.replyContent.trim()) {
        this.$message.warning('请输入回复内容');
        return;
      }

      this.submitLoading = true;
      try {
        await this.$emit('reply', {
          content: this.replyContent.trim(),
          isOfficial: false,
        });
        this.$message.success('回复成功');
        this.replyContent = '';
      } catch (error) {
        console.error('回复失败:', error);
        this.$message.error('回复失败');
      } finally {
        this.submitLoading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
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
</style>
