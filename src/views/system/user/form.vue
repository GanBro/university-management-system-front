<template>
  <div class="app-container">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="120px"
      style="max-width: 600px;"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="isCreate">
        <el-input
          v-model="form.password"
          :type="passwordVisible ? 'text' : 'password'"
          class="password-input"
        >
          <i
            slot="suffix"
            :class="['el-icon-view', 'cursor-pointer']"
            @click="passwordVisible = !passwordVisible"
          ></i>
        </el-input>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword" v-if="isCreate">
        <el-input
          v-model="form.confirmPassword"
          :type="confirmPasswordVisible ? 'text' : 'password'"
          class="password-input"
        >
          <i
            slot="suffix"
            :class="['el-icon-view', 'cursor-pointer']"
            @click="confirmPasswordVisible = !confirmPasswordVisible"
          ></i>
        </el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          :http-request="handleAvatarUpload"
          :show-file-list="false"
          :before-upload="beforeAvatarUpload"
        >
          <img
            v-if="form.avatar"
            :src="form.avatar"
            class="avatar"
            @error="handleImageError"
          >
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <div v-if="uploadLoading" class="upload-loading">
            <el-loading></el-loading>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">{{ isCreate ? '创建' : '更新' }}</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { createUser, updateUser, getUserDetail } from '@/api/user'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'UserForm',
  data() {
    const validatePass = (rule, value, callback) => {
      if (this.isCreate && !value) {
        callback(new Error('请输入密码'))
      } else {
        if (this.form.confirmPassword !== '') {
          this.$refs.form.validateField('confirmPassword')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (this.isCreate && value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      passwordVisible: false,
      confirmPasswordVisible: false,
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        role: 'user',
        avatar: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      roleOptions: [
        { value: 'admin', label: '管理员' },
        { value: 'user', label: '普通用户' }
      ]
    }
  },
  computed: {
    ...mapState('upload', ['uploadLoading']),
    isCreate() {
      return !this.$route.params.id
    }
  },
  created() {
    if (!this.isCreate) {
      this.getDetail()
    }
  },
  methods: {
    ...mapActions('upload', ['uploadFile']),
    async getDetail() {
      try {
        const { data } = await getUserDetail(this.$route.params.id)
        this.form = {
          ...data,
          password: '',
          confirmPassword: ''
        }
      } catch (error) {
        console.error('Failed to get user detail:', error)
        this.$message.error('获取用户信息失败')
      }
    },
    async handleAvatarUpload({ file }) {
      try {
        const response = await this.uploadFile({ file })
        if (response.code === 200) {
          // 确保返回的是完整的URL
          this.form.avatar = response.data
          this.$message.success('头像上传成功')
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error(error.message || '上传失败，请重试')
      }
    },
    handleImageError() {
      console.error('图片加载失败:', this.form.avatar)
      this.$message.error('图片加载失败')
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
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
        const submitData = { ...this.form }
        delete submitData.confirmPassword

        if (this.isCreate) {
          const { data } = await createUser(submitData)
          if (data.code === 200) {
            this.$message.success('用户创建成功')
            this.$router.push('/system/user')
          } else {
            this.$message.error(data.message || '创建失败')
          }
        } else {
          const { data } = await updateUser(this.$route.params.id, submitData)
          if (data.code === 200) {
            this.$message.success('更新成功')
            this.$router.push('/system/user')
          } else {
            this.$message.error(data.message || '更新失败')
          }
        }
      } catch (error) {
        console.error('表单提交失败:', error)
        this.$message.error(error.message || '操作失败，请重试')
      }
    },
    handleCancel() {
      this.$router.push('/system/user')
    }
  }
}
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.password-input {
  position: relative;
}

.cursor-pointer {
  cursor: pointer;
}

.upload-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
