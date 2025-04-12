<!-- src/components/MessageCenter/index.vue -->
<template>
  <div class="message-center">
    <el-popover
      placement="bottom"
      width="350"
      trigger="click"
      @show="loadNotifications"
    >
      <template slot="reference">
        <el-badge :value="unreadCount > 0 ? unreadCount : ''" :hidden="unreadCount === 0" class="message-badge">
          <el-button type="text" class="message-button" @click="clickNotificationIcon">
            <i class="el-icon-bell"></i>
          </el-button>
        </el-badge>
      </template>

      <div class="message-header">
        <span class="title">消息中心</span>
        <el-button
          v-if="notifications.length > 0"
          type="text"
          size="mini"
          @click="markAllAsRead"
        >
          全部标为已读
        </el-button>
      </div>

      <el-divider></el-divider>

      <el-scrollbar style="height: 350px">
        <div v-if="loading" class="message-loading">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="notifications.length === 0" class="empty-message">
          <i class="el-icon-message"></i>
          <p>暂无消息</p>
        </div>

        <div v-else class="message-list">
          <div
            v-for="(item, index) in notifications"
            :key="item.id"
            class="message-item"
            :class="{ 'is-unread': item.readStatus === 'unread' }"
            @click="handleMessageClick(item)"
          >
            <div class="message-item-header">
              <span class="message-title">{{ item.title }}</span>
              <span class="message-time">{{ formatTime(item.publishTime || item.createdAt) }}</span>
            </div>
            <div class="message-content">{{ formatContent(item.content) }}</div>
            <div class="notification-type-indicator" :class="'type-' + item.type"></div>
          </div>
        </div>
      </el-scrollbar>

      <div class="message-footer">
        <el-button type="text" @click="viewAllMessages">查看全部消息</el-button>
      </div>
    </el-popover>

    <!-- 通知详情对话框 -->
    <el-dialog
      title="通知详情"
      :visible.sync="notificationDetailVisible"
      width="500px"
      custom-class="notification-detail-dialog"
    >
      <div v-if="currentNotification" class="notification-detail">
        <h3>{{ currentNotification.title }}</h3>
        <div class="notification-meta">
          <span class="notification-type">{{ formatNotificationType(currentNotification.type) }}</span>
          <span>{{ formatTime(currentNotification.publishTime || currentNotification.createdAt) }}</span>
        </div>
        <div class="notification-content-text">
          {{ currentNotification.content || '暂无内容' }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="notificationDetailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from '@/api/notification'
import { mapGetters } from 'vuex'

export default {
  name: 'MessageCenter',
  data() {
    return {
      loading: false,
      notifications: [],
      unreadCount: 0,
      currentPage: 1,
      pageSize: 10,
      notificationDetailVisible: false,
      currentNotification: null
    }
  },
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  created() {
    this.getUnreadCount()

    // 定时刷新未读数
    this.timer = setInterval(() => {
      this.getUnreadCount()
    }, 60000) // 每分钟刷新一次
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    // 点击通知图标
    clickNotificationIcon() {
      // 当点击图标时的处理逻辑
      if (this.unreadCount > 0) {
        // 有未读消息时，可以触发事件或其他操作
      }
    },

    // 加载通知列表
    async loadNotifications() {
      if (!this.userId) return

      this.loading = true
      try {
        const res = await getUserNotifications({
          userId: this.userId,
          // 不使用分页，显示最近的通知
        })

        if (res && res.code === 200) {
          this.notifications = res.data || []
          // 限制显示的条数
          if (this.notifications.length > 10) {
            this.notifications = this.notifications.slice(0, 10)
          }
        } else {
          throw new Error(res.message || '获取通知失败')
        }
      } catch (error) {
        console.error('加载通知失败:', error)
        this.$message.error('加载通知失败')
      } finally {
        this.loading = false
      }
    },

    // 获取未读消息数
    async getUnreadCount() {
      if (!this.userId) return

      try {
        const res = await getUnreadCount({ userId: this.userId })
        if (res && res.code === 200) {
          this.unreadCount = res.data

          // 更新store中的未读状态
          this.$store.commit('notification/SET_UNREAD_COUNT', res.data)
        }
      } catch (error) {
        console.error('获取未读消息数失败:', error)
      }
    },

    // 标记所有消息为已读
    async markAllAsRead() {
      if (!this.userId) return

      try {
        const res = await markAllNotificationsAsRead({ userId: this.userId })
        if (res && res.code === 200) {
          this.$message.success('已全部标为已读')

          // 更新状态
          this.notifications.forEach(item => {
            item.readStatus = 'read'
          })
          this.unreadCount = 0

          // 更新store中的未读状态
          this.$store.commit('notification/SET_UNREAD_COUNT', 0)
        } else {
          throw new Error(res.message || '操作失败')
        }
      } catch (error) {
        console.error('标记全部已读失败:', error)
        this.$message.error('操作失败')
      }
    },

    // 处理消息点击
    async handleMessageClick(notification) {
      this.currentNotification = notification
      this.notificationDetailVisible = true

      // 如果是未读，标记为已读
      if (notification.readStatus === 'unread') {
        try {
          const res = await markNotificationAsRead(notification.id, { userId: this.userId })
          if (res && res.code === 200) {
            // 更新状态
            notification.readStatus = 'read'
            this.unreadCount = Math.max(0, this.unreadCount - 1)

            // 更新store中的未读状态
            this.$store.commit('notification/SET_UNREAD_COUNT', this.unreadCount)
          }
        } catch (error) {
          console.error('标记已读失败:', error)
        }
      }
    },

    // 查看全部消息
    viewAllMessages() {
      // 跳转到用户中心的消息页面
      this.$router.push('/user/profile')
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return ''

      const date = new Date(time)
      const now = new Date()

      // 今天的消息只显示时间
      if (date.toDateString() === now.toDateString()) {
        return date.getHours().toString().padStart(2, '0') + ':' +
          date.getMinutes().toString().padStart(2, '0')
      }

      // 昨天的消息显示"昨天"
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return '昨天 ' + date.getHours().toString().padStart(2, '0') + ':' +
          date.getMinutes().toString().padStart(2, '0')
      }

      // 其他日期显示完整日期
      return date.getFullYear() + '-' +
        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
        date.getDate().toString().padStart(2, '0')
    },

    // 格式化内容(截取前30个字符)
    formatContent(content) {
      if (!content) return ''
      if (content.length > 30) {
        return content.substring(0, 30) + '...'
      }
      return content
    },

    // 格式化通知类型
    formatNotificationType(type) {
      const typeMap = {
        'system': '系统通知',
        'user': '用户通知',
        'broadcast': '广播通知'
      }
      return typeMap[type] || type
    }
  }
}
</script>

<style lang="scss" scoped>
.message-center {
  display: inline-block;
  position: relative;
}

.message-badge {
  line-height: 1;
}

.message-button {
  padding: 0;
  font-size: 20px;
  color: #909399;
  &:hover {
    color: #409EFF;
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.message-header .title {
  font-weight: bold;
  font-size: 16px;
}

.message-loading {
  padding: 10px;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
}

.empty-message i {
  font-size: 40px;
  margin-bottom: 10px;
}

.message-list {
  padding: 0 5px;
}

.message-item {
  padding: 10px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.message-item:hover {
  background-color: #F5F7FA;
}

.message-item.is-unread {
  background-color: #F0F7FF;
}

.message-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.message-title {
  font-weight: bold;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-content {
  color: #606266;
  font-size: 13px;
  white-space: normal;
  word-break: break-all;
}

.message-footer {
  text-align: center;
  padding: 10px 0 0;
}

// 通知详情样式
.notification-detail {
  padding: 10px;
}

.notification-detail h3 {
  margin: 0 0 15px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.notification-meta {
  color: #909399;
  font-size: 13px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
}

.notification-content-text {
  line-height: 1.6;
  color: #606266;
  white-space: pre-line;
  font-size: 14px;
  min-height: 60px;
  padding: 15px 0;
}

.notification-type-indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;

  &.type-system {
    background-color: #409EFF; // 蓝色，系统通知
  }

  &.type-user {
    background-color: #67C23A; // 绿色，用户通知
  }

  &.type-broadcast {
    background-color: #E6A23C; // 黄色，广播通知
  }
}

.notification-type {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: #f0f2f5;
}
</style>
