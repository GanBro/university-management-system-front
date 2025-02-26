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
            <p class="role">管理员</p>
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
              <span>最后登录：{{ formatTime(userForm.lastLogin) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧设置表单 -->
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="clearfix">
            <span>账号设置</span>
          </div>
          
          <el-tabs v-model="activeTab">
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

            <!-- 安全设置 -->
            <el-tab-pane label="安全设置" name="security">
              <el-form class="setting-form">
                <el-form-item label="登录密码" label-width="100px">
                  <div class="password-item">
                    <span class="password-text">已设置</span>
                    <el-button type="text" @click="showChangePassword">修改密码</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="账号保护" label-width="100px">
                  <div class="security-item">
                    <el-switch
                      v-model="securitySettings.twoFactorAuth"
                      @change="handleSecurityChange"
                    ></el-switch>
                    <span class="security-text">两步验证</span>
                  </div>
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 通知设置 -->
            <el-tab-pane label="通知设置" name="notification">
              <el-form class="setting-form">
                <el-form-item label="系统通知" label-width="100px">
                  <el-switch
                    v-model="notificationSettings.systemNotification"
                    @change="handleNotificationChange"
                  ></el-switch>
                </el-form-item>
                <el-form-item label="邮件通知" label-width="100px">
                  <el-switch
                    v-model="notificationSettings.emailNotification"
                    @change="handleNotificationChange"
                  ></el-switch>
                </el-form-item>
              </el-form>
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
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { mapState } from 'vuex'
import { updateProfile, updatePassword } from '@/api/user'
import request from '@/utils/request'

export default {
  name: 'Settings',
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
      userForm: {
        username: '',
        email: '',
        avatar: '',
        role: 'admin',
        lastLogin: new Date()
      },
      passwordDialogVisible: false,
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
      securitySettings: {
        twoFactorAuth: false
      },
      notificationSettings: {
        systemNotification: true,
        emailNotification: true
      },
      uploadUrl: process.env.VUE_APP_BASE_API + '/upload/avatar',
      headers: {
        token: getToken()
      },
      baseUrl: process.env.VUE_APP_BASE_API,
      uploadLoading: false
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    formatTime(time) {
      if (!time) return '暂无记录'
      const date = new Date(time)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    async getUserInfo() {
      try {
        // 从后端获取用户信息
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
            role: user.role,
            lastLogin: user.lastLogin
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败')
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

    handleSecurityChange(value) {
      this.$message.info('两步验证设置已更新')
    },

    handleNotificationChange() {
      this.$message.info('通知设置已更新')
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

    .security-item {
      display: flex;
      align-items: center;

      .security-text {
        margin-left: 10px;
        color: #606266;
      }
    }
  }
}

::v-deep .el-tabs__nav-wrap::after {
  height: 1px;
}

::v-deep .el-input-group__prepend {
  background-color: #fff;
}
</style> 