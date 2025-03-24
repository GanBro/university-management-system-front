<template>
  <div class="app-container">
    <el-card class="settings-card">
      <!-- 个人信息设置 -->
      <div class="section">
        <h3>个人信息</h3>
        <el-form :model="userForm" label-width="100px">
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              :action="uploadUrl"
              :headers="headers"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :on-success="handleAvatarSuccess">
              <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userForm.email"></el-input>
          </el-form-item>
        </el-form>
      </div>

      <!-- 安全设置 -->
      <div class="section">
        <h3>安全设置</h3>
        <el-button type="primary" @click="showChangePassword">修改密码</el-button>
      </div>

      <!-- 保存按钮 -->
      <div class="actions">
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </el-card>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" :visible.sync="passwordDialogVisible">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword"></el-input>
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
      uploadUrl: process.env.VUE_APP_BASE_API + '/user/avatar',
      headers: {
        Authorization: getToken()
      },
      userForm: {
        username: '',
        email: '',
        avatar: ''
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
      }
    }
  },
  created() {
    this.getUserInfo()
  },
  methods: {
    async getUserInfo() {
      try {
        const res = await this.$http.get('/user/info')
        if (res.data.code === 200) {
          this.userForm = res.data.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },

    handleAvatarSuccess(res) {
      if (res.code === 200) {
        this.userForm.avatar = res.data
        this.$message.success('头像上传成功')
      } else {
        this.$message.error(res.msg || '头像上传失败')
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
        const res = await this.$http.put('/user/password', {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        })
        if (res.data.code === 200) {
          this.$message.success('密码修改成功,请重新登录')
          this.passwordDialogVisible = false
          // 退出登录
          this.$store.dispatch('user/logout')
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
      }
    },

    async saveSettings() {
      try {
        const res = await this.$http.put('/user/update', this.userForm)
        if (res.data.code === 200) {
          this.$message.success('设置保存成功')
        } else {
          this.$message.error(res.msg || '设置保存失败')
        }
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-card {
  max-width: 800px;
  margin: 0 auto;

  .section {
    margin-bottom: 30px;

    h3 {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
      font-weight: 500;
    }
  }

  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;

    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
    }
  }

  .actions {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
