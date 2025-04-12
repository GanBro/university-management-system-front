<!-- src/views/user/profile/index.vue -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 左侧个人信息卡片 -->
      <el-col :span="8">
        <el-card class="profile-card" shadow="hover">
          <div class="profile-header">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="headers"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"
            >
              <div class="avatar-wrapper">
                <img v-if="userForm.avatar" :src="userForm.avatar.startsWith('http') ? userForm.avatar : baseUrl + userForm.avatar" class="avatar" @error="handleImageError">
                <i v-else class="el-icon-user-solid avatar-icon"></i>
                <div class="avatar-mask">
                  <i class="el-icon-camera camera-icon"></i>
                </div>
                <div v-if="uploadLoading" class="upload-loading">
                  <el-loading></el-loading>
                </div>
              </div>
            </el-upload>
            <h2 class="username">{{ userForm.username }}</h2>
            <p class="role">普通用户</p>
          </div>
          <div class="profile-info">
            <div class="info-item">
              <i class="el-icon-user"></i>
              <span>{{ userForm.username }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-message"></i>
              <span>{{ userForm.email }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-time"></i>
              <span>最后登录：{{ formatTime(userForm.lastLogin) || '暂无记录' }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧设置和通知 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <!-- 基本信息 -->
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="userForm" label-width="100px" class="setting-form">
                <el-form-item label="用户名">
                  <el-input v-model="userForm.username" disabled>
                    <template slot="prepend">
                      <i class="el-icon-user"></i>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="userForm.email">
                    <template slot="prepend">
                      <i class="el-icon-message"></i>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveSettings">保存修改</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 通知消息 -->
            <el-tab-pane label="通知消息" name="notifications">
              <div class="notification-container">
                <div class="notification-header">
                  <el-button type="text" @click="markAllAsRead" v-if="unreadNotifications.length > 0">
                    <i class="el-icon-check"></i> 全部标为已读
                  </el-button>
                  <el-button type="text" @click="fetchNotifications">
                    <i class="el-icon-refresh"></i> 刷新消息
                  </el-button>
                </div>

                <el-tabs v-model="notificationTab" class="notification-tabs">
                  <el-tab-pane label="未读消息" name="unread">
                    <div v-if="unreadNotifications.length === 0" class="empty-text">
                      <el-empty description="暂无未读消息"></el-empty>
                    </div>
                    <div v-else class="notification-list">
                      <div
                        v-for="item in unreadNotifications"
                        :key="item.id"
                        class="notification-item unread"
                        @click="handleNotificationClick(item)"
                      >
                        <div class="notification-dot" :class="getPriorityClass(item.priority)"></div>
                        <div class="notification-content">
                          <div class="notification-title">
                            {{ item.title }}
                            <el-tag size="mini" :type="getTypeTag(item.type)" class="notification-type-tag">{{ formatType(item.type) }}</el-tag>
                            <el-tag size="mini" :type="getPriorityTag(item.priority)" class="notification-priority-tag">{{ formatPriority(item.priority) }}</el-tag>
                          </div>
                          <div class="notification-brief">{{ truncateContent(item.content) }}</div>
                          <div class="notification-time">{{ formatTime(item.createdAt) }}</div>
                        </div>
                        <i class="el-icon-arrow-right notification-arrow"></i>
                      </div>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane label="全部消息" name="all">
                    <div v-if="allNotifications.length === 0" class="empty-text">
                      <el-empty description="暂无消息"></el-empty>
                    </div>
                    <div v-else class="notification-list">
                      <div
                        v-for="item in allNotifications"
                        :key="item.id"
                        class="notification-item"
                        :class="{ 'is-read': item.readStatus === 'read' }"
                        @click="handleNotificationClick(item)"
                      >
                        <div v-if="item.readStatus === 'unread'" class="notification-dot" :class="getPriorityClass(item.priority)"></div>
                        <div class="notification-content">
                          <div class="notification-title">
                            {{ item.title }}
                            <el-tag size="mini" :type="getTypeTag(item.type)" class="notification-type-tag">{{ formatType(item.type) }}</el-tag>
                            <el-tag size="mini" :type="getPriorityTag(item.priority)" class="notification-priority-tag">{{ formatPriority(item.priority) }}</el-tag>
                          </div>
                          <div class="notification-brief">{{ truncateContent(item.content) }}</div>
                          <div class="notification-time">{{ formatTime(item.createdAt) }}</div>
                        </div>
                        <i class="el-icon-arrow-right notification-arrow"></i>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>

                <!-- Pagination if needed -->
                <div class="notification-pagination" v-if="allNotifications.length > 10">
                  <el-pagination
                    @current-change="handleNotificationPageChange"
                    :current-page="notificationPage"
                    :page-size="10"
                    layout="prev, pager, next"
                    :total="allNotifications.length">
                  </el-pagination>
                </div>
              </div>
            </el-tab-pane>

            <!-- 安全设置 -->
            <el-tab-pane label="安全设置" name="security">
              <el-form class="setting-form">
                <el-form-item label="登录密码" label-width="100px">
                  <div class="password-item">
                    <span class="password-text">已设置</span>
                    <el-button type="text" @click="showChangePassword">修改密码</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 关注高校标签页 -->
            <el-tab-pane label="关注高校" name="universities">
              <div class="university-follow">
                <!-- 切换按钮 -->
                <div class="mb-6 flex justify-between items-center">
                  <div class="tabs">
                    <el-button-group>
                      <el-button
                        :type="followTab === 'add' ? 'primary' : ''"
                        @click="followTab = 'add'"
                      >
                        <i class="el-icon-plus"></i> 添加高校
                      </el-button>
                      <el-button
                        :type="followTab === 'followed' ? 'primary' : ''"
                        @click="followTab = 'followed'"
                      >
                        <i class="el-icon-star-on"></i> 已关注
                      </el-button>
                    </el-button-group>
                  </div>

                  <!-- Export button -->
                  <el-button
                    type="primary"
                    icon="el-icon-download"
                    size="small"
                    @click="handleDownload"
                    :loading="downloadLoading"
                  >
                    导出关注高校
                  </el-button>
                </div>

                <!-- 添加高校面板 -->
                <div v-if="followTab === 'add'">
                  <el-form :inline="true" class="mb-4">
                    <el-form-item>
                      <el-input
                        v-model="universitySearch.name"
                        placeholder="请输入院校名称"
                        prefix-icon="el-icon-search"
                      ></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-select v-model="universitySearch.province" placeholder="所在地" clearable>
                        <el-option label="北京" value="北京"></el-option>
                        <el-option label="上海" value="上海"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item>
                      <el-select v-model="universitySearch.type" placeholder="隶属" clearable>
                        <el-option label="教育部" value="教育部"></el-option>
                        <el-option label="省属" value="省属"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-form>

                  <el-table :data="universities" border>
                    <el-table-column prop="name" label="院校名称"></el-table-column>
                    <el-table-column prop="province" label="所在地"></el-table-column>
                    <el-table-column prop="type" label="隶属"></el-table-column>
                    <el-table-column label="操作" width="120">
                      <template slot-scope="scope">
                        <el-button
                          type="text"
                          @click="handleFollow(scope.row)"
                          :disabled="scope.row.isFollowed"
                        >
                          {{ scope.row.isFollowed ? '已关注' : '关注' }}
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <!-- 已关注面板 -->
                <div v-else>
                  <div v-if="followedUniversities.length === 0" class="empty-text">
                    <el-empty description="暂无关注的高校"></el-empty>
                  </div>
                  <div v-else class="followed-grid">
                    <el-card v-for="uni in followedUniversities" :key="uni.id" class="mb-4">
                      <div class="flex justify-between items-center">
                        <div>
                          <h4 class="mb-2">{{ uni.name }}</h4>
                          <p class="text-gray-500">{{ uni.province }} | {{ uni.type }}</p>
                        </div>
                        <el-button type="text" @click="handleUnfollow(uni.id)">
                          <i class="el-icon-close"></i>
                        </el-button>
                      </div>
                    </el-card>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" :visible.sync="passwordDialogVisible" width="400px">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword" show-password></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认</el-button>
      </div>
    </el-dialog>

    <!-- 通知详情对话框 -->
    <el-dialog title="通知详情" :visible.sync="notificationDetailVisible" width="500px" custom-class="notification-detail-dialog">
      <div v-if="currentNotification" class="notification-detail">
        <h3>{{ currentNotification.title }}</h3>
        <div class="notification-meta">
          <div class="meta-item">
            <span class="label">通知类型：</span>
            <el-tag :type="getTypeTag(currentNotification.type)" size="small">{{ formatType(currentNotification.type) }}</el-tag>
          </div>
          <div class="meta-item">
            <span class="label">优先级：</span>
            <el-tag :type="getPriorityTag(currentNotification.priority)" size="small">{{ formatPriority(currentNotification.priority) }}</el-tag>
          </div>
          <div class="meta-item">
            <span class="label">发布时间：</span>
            <span>{{ formatTime(currentNotification.createdAt) }}</span>
          </div>
          <div class="meta-item" v-if="currentNotification.publishTime">
            <span class="label">发送时间：</span>
            <span>{{ formatTime(currentNotification.publishTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">阅读状态：</span>
            <el-tag :type="currentNotification.readStatus === 'read' ? 'info' : 'success'" size="small">
              {{ currentNotification.readStatus === 'read' ? '已读' : '未读' }}
            </el-tag>
          </div>
        </div>
        <div class="notification-content-box">
          <div class="content-label">通知内容：</div>
          <div class="notification-content-text">
            {{ currentNotification.content || '暂无内容' }}
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="notificationDetailVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 导出配置对话框 -->
    <el-dialog
      title="导出配置"
      :visible.sync="exportDialogVisible"
      width="30%"
    >
      <el-form :model="exportConfig" label-width="100px">
        <el-form-item label="选择字段">
          <el-checkbox-group v-model="exportConfig.fields">
            <el-checkbox label="name">高校名称</el-checkbox>
            <el-checkbox label="province">所在地</el-checkbox>
            <el-checkbox label="type">类型</el-checkbox>
            <el-checkbox label="level">层次</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleExportConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { updateProfile, updatePassword } from '@/api/user'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/api/notification'
import { followUniversity, unfollowUniversity, getFollowedUniversities } from '@/api/user'
import { getUniversityList } from '@/api/university'
import request from '@/utils/request'

export default {
  name: 'UserProfile',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'basic',
      notificationTab: 'unread',
      followTab: 'add',
      userForm: {
        username: '',
        email: '',
        avatar: '',
        lastLogin: null
      },
      passwordDialogVisible: false,
      notificationDetailVisible: false,
      currentNotification: null,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload/avatar',
      headers: {
        token: getToken()
      },
      baseUrl: process.env.VUE_APP_BASE_API,
      uploadLoading: false,
      allNotifications: [],
      unreadNotifications: [],
      notificationLoading: false,
      notificationPage: 1,
      // 高校收藏相关
      universitySearch: {
        name: '',
        province: '',
        type: ''
      },
      universities: [],
      followedUniversities: [],
      followedUniversitiesLoaded: false, // 新增：标记已关注高校是否已加载
      // 导出相关
      downloadLoading: false,
      exportDialogVisible: false,
      exportConfig: {
        fields: ['name', 'province', 'type', 'level']
      }
    }
  },
  created() {
    this.getUserInfo()
    this.fetchNotifications()
    // 先加载已关注高校，再加载所有高校
    this.loadFollowedUniversities().then(() => {
      this.loadUniversities()
    })
  },
  watch: {
    'universitySearch': {
      handler() {
        // 确保已加载关注高校数据后再加载大学列表
        if (this.followedUniversitiesLoaded) {
          this.loadUniversities()
        } else {
          // 如果关注高校还未加载，先加载再更新列表
          this.loadFollowedUniversities().then(() => {
            this.loadUniversities()
          })
        }
      },
      deep: true
    }
  },
  methods: {
    formatTime(time) {
      if (!time) return ''; // 当时间为空时返回空字符串
      const date = new Date(time);
      if (isNaN(date.getTime())) return ''; // 检查日期是否有效

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    // 新增：格式化通知类型
    formatType(type) {
      const typeMap = {
        'user': '用户通知',
        'broadcast': '广播通知'
      }
      return typeMap[type] || type
    },

    // 新增：格式化通知优先级
    formatPriority(priority) {
      const priorityMap = {
        0: '普通',
        1: '重要',
        2: '紧急'
      }
      return priorityMap[priority] || '普通'
    },

    // 新增：获取通知类型对应的标签类型
    getTypeTag(type) {
      const typeTagMap = {
        'user': 'success',
        'broadcast': 'warning'
      }
      return typeTagMap[type] || ''
    },

    // 新增：获取优先级对应的标签类型
    getPriorityTag(priority) {
      const priorityTagMap = {
        0: 'info',
        1: 'warning',
        2: 'danger'
      }
      return priorityTagMap[priority] || 'info'
    },

    // 新增：获取优先级对应的样式类
    getPriorityClass(priority) {
      const priorityClassMap = {
        0: 'priority-normal',
        1: 'priority-important',
        2: 'priority-urgent'
      }
      return priorityClassMap[priority] || 'priority-normal'
    },

    // 新增：截断通知内容
    truncateContent(content) {
      if (!content) return '';
      return content.length > 50 ? content.substring(0, 50) + '...' : content;
    },

    async getUserInfo() {
      try {
        const response = await request({
          url: '/getUserByToken',
          method: 'get',
          params: { token: getToken() }
        })

        if (response.code === 200 && response.data.user) {
          const user = response.data.user
          this.userForm = {
            username: user.username,
            email: user.email,
            avatar: user.avatar || '',
            lastLogin: user.lastLogin
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败')
      }
    },

    async fetchNotifications() {
      try {
        this.notificationLoading = true;
        const userId = this.$store.getters.userId;

        // 确保userId存在
        if (!userId) {
          console.error('获取通知失败: 未找到用户ID');
          this.$message.error('获取通知失败: 请先登录');
          return;
        }

        const res = await getUserNotifications(userId);

        if (res.code === 200) {
          this.allNotifications = res.data || [];
          // 修正：使用readStatus字段而不是status字段来过滤未读消息
          this.unreadNotifications = this.allNotifications.filter(item => item.readStatus === 'unread');

          // 更新store中的未读状态
          if (this.$store.getters.hasUnreadNotifications !== (this.unreadNotifications.length > 0)) {
            this.$store.commit('notification/SET_HAS_UNREAD_NOTIFICATIONS', this.unreadNotifications.length > 0);
          }
        } else {
          throw new Error(res.message || '获取通知失败');
        }
      } catch (error) {
        console.error('获取通知失败:', error);
        this.$message.error('获取通知失败，请刷新页面重试');
      } finally {
        this.notificationLoading = false;
      }
    },

    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isPNG = file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        return false
      }
      return true
    },

    handleImageError() {
      this.$message.warning('头像加载失败，已使用默认头像')
      this.userForm.avatar = '' // 使用默认头像
    },

    async handleAvatarSuccess(response, file) {
      try {
        if (response.code === 200) {
          const avatarUrl = response.data
          // 更新用户头像
          const updateRes = await updateProfile({
            userId: this.$store.getters.userId,
            avatar: avatarUrl
          })

          if (updateRes.code === 200) {
            this.userForm.avatar = avatarUrl
            this.$message.success('头像上传成功')
            // 更新vuex中的用户信息
            await this.$store.dispatch('user/getInfo')
          } else {
            throw new Error(updateRes.message || '更新头像失败')
          }
        } else {
          throw new Error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error(error.message || '上传失败，请重试')
      }
    },

    handleAvatarError(error) {
      console.error('上传失败:', error)
      this.$message.error(error.message || '上传失败，请重试')
    },

    async handleNotificationClick(notification) {
      this.currentNotification = notification;
      this.notificationDetailVisible = true;

      if (notification.readStatus === 'unread') {
        try {
          const userId = this.$store.getters.userId;

          // 确保userId存在
          if (!userId) {
            throw new Error('未找到用户ID');
          }

          const res = await markNotificationAsRead(notification.id, userId);

          if (res.code === 200) {
            // 更新本地通知状态
            notification.readStatus = 'read';
            this.unreadNotifications = this.allNotifications.filter(item => item.readStatus === 'unread');

            // 更新store中的未读状态
            if (this.unreadNotifications.length === 0) {
              this.$store.commit('notification/SET_HAS_UNREAD_NOTIFICATIONS', false);
            }
          } else {
            throw new Error(res.message || '标记已读失败');
          }
        } catch (error) {
          console.error('标记通知已读失败:', error);
          // 即使标记失败，仍然显示通知详情
        }
      }
    },

    async markAllAsRead() {
      try {
        const userId = this.$store.getters.userId;

        // 确保userId存在
        if (!userId) {
          throw new Error('未找到用户ID');
        }

        const res = await markAllNotificationsAsRead(userId);

        if (res.code === 200) {
          // 更新所有通知为已读状态
          this.allNotifications.forEach(notification => {
            notification.readStatus = 'read';
          });
          this.unreadNotifications = [];

          // 更新store
          this.$store.commit('notification/SET_HAS_UNREAD_NOTIFICATIONS', false);

          this.$message.success('已全部标记为已读');
        } else {
          throw new Error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('标记全部已读失败:', error);
        this.$message.error('操作失败，请重试');
      }
    },

    handleNotificationPageChange(page) {
      this.notificationPage = page;
    },

    handleTabClick(tab) {
      if (tab.name === 'notifications') {
        this.fetchNotifications();
      }
    },

    showChangePassword() {
      this.passwordDialogVisible = true
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    },

    async changePassword() {
      try {
        await this.$refs.passwordForm.validate()
        const res = await updatePassword({
          userId: this.$store.getters.userId,
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        if (res.code === 200) {
          this.$message.success('密码修改成功,请重新登录')
          this.passwordDialogVisible = false
          // 退出登录
          this.$store.dispatch('user/logout')
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        this.$message.error(error.message || '修改密码失败，请重试')
      }
    },

    async saveSettings() {
      try {
        const res = await updateProfile({
          userId: this.$store.getters.userId,
          email: this.userForm.email,
          avatar: this.userForm.avatar
        })
        if (res.code === 200) {
          this.$message.success('设置保存成功')
          // 更新vuex中的用户信息
          await this.$store.dispatch('user/getInfo')
        } else {
          throw new Error(res.message || '保存失败')
        }
      } catch (error) {
        console.error('保存设置失败:', error)
        this.$message.error(error.message || '保存失败，请重试')
      }
    },

    // 高校收藏相关方法 - 改进版
    async loadUniversities() {
      try {
        const { data } = await getUniversityList({
          name: this.universitySearch.name,
          province: this.universitySearch.province,
          type: this.universitySearch.type
        })

        // 创建已关注高校ID的Set，用于高效查找
        const followedIds = new Set(this.followedUniversities.map(uni => uni.id))

        // 使用Set高效更新isFollowed状态
        this.universities = data.records.map(uni => ({
          ...uni,
          isFollowed: followedIds.has(uni.id)
        }))
      } catch (error) {
        console.error('加载高校列表失败:', error)
        this.$message.error('加载高校列表失败')
      }
    },

    async loadFollowedUniversities() {
      try {
        const userId = this.$store.getters.userId
        const { data } = await getFollowedUniversities(userId)
        this.followedUniversities = data
        this.followedUniversitiesLoaded = true // 设置标记为已加载
        return data // 返回数据以支持Promise链
      } catch (error) {
        console.error('加载已关注高校失败:', error)
        this.$message.error('加载已关注高校失败')
        return [] // 出错时返回空数组
      }
    },

    // 同步大学关注状态
    syncUniversityFollowState() {
      // 创建已关注高校ID的Set
      const followedIds = new Set(this.followedUniversities.map(uni => uni.id))

      // 更新所有大学的isFollowed属性
      this.universities = this.universities.map(uni => ({
        ...uni,
        isFollowed: followedIds.has(uni.id)
      }))
    },

    async handleFollow(university) {
      try {
        const userId = this.$store.getters.userId
        await followUniversity(userId, university.id)

        // 更新列表中的大学
        university.isFollowed = true

        // 添加到已关注列表
        this.followedUniversities.push({...university})

        this.$message.success('关注成功')
      } catch (error) {
        console.error('关注失败:', error)
        this.$message.error('关注失败')
      }
    },

    async handleUnfollow(id) {
      try {
        const userId = this.$store.getters.userId
        await unfollowUniversity(userId, id)

        // 更新列表中的大学状态
        const university = this.universities.find(u => u.id === id)
        if (university) {
          university.isFollowed = false
        }

        // 从已关注列表中移除
        this.followedUniversities = this.followedUniversities.filter(u => u.id !== id)

        this.$message.success('已取消关注')
      } catch (error) {
        console.error('取消关注失败:', error)
        this.$message.error('取消关注失败')
      }
    },

    // 导出功能相关方法
    handleDownload() {
      this.exportDialogVisible = true;
    },

    async handleExportConfirm() {
      try {
        this.exportDialogVisible = false;
        this.downloadLoading = true;

        // 获取当前用户ID
        const userId = this.$store.getters.userId;

        // 准备导出查询参数
        const exportQuery = {
          userId: userId, // 明确传递userId
          fields: this.exportConfig.fields,
          followedOnly: true
        };

        // 使用store action导出
        await this.$store.dispatch('university/exportList', exportQuery);

        this.$message({
          type: 'success',
          message: '导出成功'
        });
      } catch (error) {
        this.$message({
          message: `导出失败: ${error.message || '未知错误'}`,
          type: 'error',
          duration: 5 * 1000
        });
      } finally {
        this.downloadLoading = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .profile-card {
    .profile-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;

      .avatar-wrapper {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 15px;
        border-radius: 50%;
        overflow: hidden;
        cursor: pointer;

        .avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-icon {
          font-size: 60px;
          color: #909399;
          line-height: 120px;
          background: #f5f7fa;
          width: 100%;
          height: 100%;
        }

        .avatar-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: none;
          justify-content: center;
          align-items: center;

          .camera-icon {
            color: #fff;
            font-size: 24px;
          }
        }

        &:hover .avatar-mask {
          display: flex;
        }

        .upload-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      .username {
        margin: 10px 0 5px;
        font-size: 20px;
        font-weight: 500;
      }

      .role {
        color: #909399;
        font-size: 14px;
      }
    }

    .profile-info {
      padding: 20px 0;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        i {
          font-size: 16px;
          color: #909399;
          margin-right: 10px;
          width: 20px;
          text-align: center;
        }

        span {
          color: #606266;
          font-size: 14px;
        }
      }
    }
  }

  .setting-form {
    max-width: 600px;
    margin: 20px auto;

    .password-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .password-text {
        color: #606266;
      }
    }
  }

  .notification-container {
    margin-top: 10px;
  }

  .notification-header {
    display: flex;
    justify-content: flex-end;
    padding: 0 10px 10px;
    border-bottom: 1px solid #ebeef5;
  }

  .notification-tabs {
    margin-top: 10px;
  }

  .notification-list {
    max-height: 500px;
    overflow-y: auto;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 15px;
    cursor: pointer;
    border-bottom: 1px solid #f5f7fa;
    transition: all 0.3s;
    position: relative;
  }

  .notification-item:hover {
    background-color: #f5f7fa;
  }

  .notification-item.is-read {
    opacity: 0.7;
  }

  .notification-item.unread {
    background-color: #f0faff;
  }

  .notification-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #409EFF;
    margin-right: 12px;
    margin-top: 6px;
    flex-shrink: 0;

    &.priority-normal {
      background-color: #409EFF;
    }

    &.priority-important {
      background-color: #E6A23C;
    }

    &.priority-urgent {
      background-color: #F56C6C;
    }
  }

  .notification-content {
    flex: 1;
  }

  .notification-title {
    font-size: 14px;
    color: #303133;
    margin-bottom: 5px;
    font-weight: 500;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .notification-type-tag,
  .notification-priority-tag {
    margin-left: 5px;
    font-size: 10px;
    height: 18px;
    line-height: 16px;
    padding: 0 5px;
  }

  .notification-brief {
    font-size: 13px;
    color: #606266;
    margin-bottom: 5px;
    line-height: 1.4;
  }

  .notification-time {
    font-size: 12px;
    color: #909399;
  }

  .notification-arrow {
    color: #c0c4cc;
    margin-left: 10px;
    margin-top: 6px;
  }

  .empty-text {
    padding: 30px 0;
    text-align: center;
  }

  .notification-pagination {
    margin-top: 15px;
    text-align: center;
  }

  .notification-detail {
    padding: 10px;

    h3 {
      margin: 0 0 15px;
      color: #303133;
      font-size: 18px;
      font-weight: 600;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebeef5;
    }

    .notification-meta {
      margin-bottom: 20px;

      .meta-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .label {
          width: 80px;
          font-weight: 500;
          color: #606266;
        }
      }
    }

    .notification-content-box {
      background: #f8f8f8;
      border-radius: 4px;
      padding: 15px;

      .content-label {
        font-weight: 500;
        margin-bottom: 10px;
        color: #606266;
      }

      .notification-content-text {
        line-height: 1.6;
        color: #303133;
        white-space: pre-line;
        font-size: 14px;
        min-height: 60px;
      }
    }
  }
}

/* 高校收藏相关样式 */
.university-follow {
  .mb-4 {
    margin-bottom: 16px;
  }

  .mb-6 {
    margin-bottom: 24px;
  }

  .flex {
    display: flex;
  }

  .justify-between {
    justify-content: space-between;
  }

  .items-center {
    align-items: center;
  }

  .followed-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .mb-2 {
    margin-bottom: 8px;
  }

  .text-gray-500 {
    color: #909399;
  }
}

::v-deep .el-tabs__nav-wrap::after {
  height: 1px;
}

::v-deep .el-input-group__prepend {
  background-color: #fff;
}

::v-deep .notification-detail-dialog .el-dialog__body {
  padding-top: 10px;
}
</style>
