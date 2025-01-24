<!-- src/views/user/profile/index.vue -->
<template>
  <div class="user-profile">
    <div class="profile-container">
      <!-- 左侧个人信息卡片 -->
      <el-card class="profile-card">
        <div class="avatar-container">
          <el-avatar :size="100" :src="userInfo.avatar">
            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
          </el-avatar>
          <h3>{{ userInfo.username }}</h3>
          <p class="role-tag">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</p>
        </div>
        <div class="info-list">
          <div class="info-item">
            <i class="el-icon-time"></i>
            <span>注册时间: {{ formatDate(userInfo.createdAt) }}</span>
          </div>
          <div class="info-item">
            <i class="el-icon-date"></i>
            <span>最后登录: {{ formatDate(userInfo.lastLogin) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 右侧内容区 -->
      <el-card class="content-card">
        <el-tabs v-model="activeTab">
          <!-- 个人资料标签页 -->
          <el-tab-pane label="个人资料" name="profile">
            <el-form ref="profileForm" :model="profileForm" :rules="rules" label-width="100px">
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled></el-input>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" :disabled="!isEditing"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleEdit">
                  {{ isEditing ? '保存' : '编辑' }}
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 账号安全标签页 -->
          <el-tab-pane label="账号安全" name="security">
            <el-alert
              title="为了保证账号安全，请设置6位以上的密码。"
              type="info"
              :closable="false"
              show-icon>
            </el-alert>
            <el-form ref="passwordForm" :model="passwordForm" :rules="passwordRules" label-width="100px" class="password-form">
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input type="password" v-model="passwordForm.oldPassword" show-password></el-input>
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input type="password" v-model="passwordForm.newPassword" show-password></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input type="password" v-model="passwordForm.confirmPassword" show-password></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handlePasswordChange">修改密码</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 消息通知标签页 -->
          <el-tab-pane label="消息通知" name="notifications">
            <div class="notification-settings">
              <el-card class="notification-item">
                <div class="notification-header">
                  <i class="el-icon-bell"></i>
                  <div class="notification-info">
                    <h4>系统通知</h4>
                    <p>接收系统更新和重要提醒</p>
                  </div>
                  <el-switch v-model="notificationSettings.system"></el-switch>
                </div>
              </el-card>
              <el-card class="notification-item">
                <div class="notification-header">
                  <i class="el-icon-message"></i>
                  <div class="notification-info">
                    <h4>互动消息</h4>
                    <p>接收回复和评论通知</p>
                  </div>
                  <el-switch v-model="notificationSettings.interaction"></el-switch>
                </div>
              </el-card>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updatePassword, updateProfile } from '@/api/user'
import { validatePassword, validatePasswordMatch } from '@/utils/validate'

export default {
  name: 'UserProfile',
  data() {
    const validateNewPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入新密码'))
      } else {
        const validation = validatePassword(value)
        if (!validation.isValid) {
          callback(new Error(validation.message))
        } else {
          if (this.passwordForm.confirmPassword !== '') {
            this.$refs.passwordForm.validateField('confirmPassword')
          }
          callback()
        }
      }
    }
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (!validatePasswordMatch(value, this.passwordForm.newPassword)) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'profile',
      isEditing: false,
      profileForm: {
        username: '',
        email: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入当前密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, trigger: 'blur', validator: validateNewPassword }
        ],
        confirmPassword: [
          { required: true, trigger: 'blur', validator: validateConfirmPassword }
        ]
      },
      notificationSettings: {
        system: true,
        interaction: true
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'role',
      'userId'
    ]),
    userInfo() {
      return {
        username: this.name,
        avatar: this.avatar,
        role: this.role,
        userId: this.userId,
        createdAt: '2024-12-27',
        lastLogin: new Date()
      }
    }
  },
  created() {
    this.initProfileForm()
  },
  methods: {
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    initProfileForm() {
      this.profileForm.username = this.userInfo.username
      this.profileForm.email = '2551921037@qq.com'
    },
    handleEdit() {
      if (this.isEditing) {
        this.$refs.profileForm.validate(valid => {
          if (valid) {
            updateProfile({
              userId: this.userInfo.userId,
              email: this.profileForm.email,
              avatar: this.profileForm.avatar
            }).then(response => {
              this.$message.success('保存成功')
              this.isEditing = false
            }).catch(error => {
              this.$message.error('保存失败: ' + error.message)
            })
          }
        })
      } else {
        this.isEditing = true
      }
    },
    handlePasswordChange() {
      this.$refs.passwordForm.validate(valid => {
        if (valid) {
          updatePassword({
            userId: this.userInfo.userId,
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword
          }).then(response => {
            this.$message.success('密码修改成功')
            this.passwordForm = {
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }
          }).catch(error => {
            this.$message.error('密码修改失败: ' + error.message)
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-profile {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);

  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .profile-card {
    .avatar-container {
      text-align: center;
      padding: 20px 0;

      h3 {
        margin: 10px 0 5px;
        font-size: 18px;
      }

      .role-tag {
        color: #909399;
        font-size: 14px;
      }
    }

    .info-list {
      margin-top: 20px;

      .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        color: #606266;
        font-size: 14px;

        i {
          margin-right: 8px;
          font-size: 16px;
        }
      }
    }
  }

  .content-card {
    .password-form {
      max-width: 500px;
      margin-top: 20px;
    }
  }

  .notification-settings {
    .notification-item {
      margin-bottom: 15px;

      .notification-header {
        display: flex;
        align-items: center;
        gap: 15px;

        i {
          font-size: 24px;
          color: #409EFF;
        }

        .notification-info {
          flex: 1;

          h4 {
            margin: 0 0 5px;
            font-size: 16px;
          }

          p {
            margin: 0;
            color: #909399;
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
