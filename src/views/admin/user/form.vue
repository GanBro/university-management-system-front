<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ isCreate ? '添加用户' : '编辑用户' }}</span>
      </div>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px;"
        v-loading="formLoading"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!isCreate" />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="isCreate">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="password-input"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword" v-if="isCreate">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            class="password-input"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%" @change="handleRoleChange">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.role === 'university_admin'"
          label="管理高校"
          prop="universityId"
        >
          <el-select
            v-model="form.universityId"
            placeholder="请选择管理的高校"
            style="width: 100%"
            :loading="loadingUniversities"
          >
            <el-option
              v-for="uni in universities"
              :key="uni.id"
              :label="uni.name"
              :value="uni.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :http-request="handleAvatarUpload"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="form.avatar"
              :src="getAvatarUrl(form.avatar)"
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
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isCreate ? '创建' : '更新' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createUser, updateUser, getUserDetail } from '@/api/user'
import { getUniversityList } from '@/api/university'
import { mapState, mapActions } from 'vuex'
import defaultAvatar from '@/assets/images/demo.jpg'

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
      formLoading: false,
      submitting: false,
      passwordVisible: false,
      confirmPasswordVisible: false,
      defaultAvatarUrl: defaultAvatar, // 保存默认头像的URL
      form: {
        userId: undefined,
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        role: 'user',
        avatar: '',
        universityId: undefined
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
        ],
        universityId: [
          { required: true, message: '请选择管理的高校', trigger: 'change' }
        ]
      },
      roleOptions: [
        { value: 'admin', label: '管理员' },
        { value: 'user', label: '普通用户' },
        { value: 'university_admin', label: '高校管理员' }
      ],
      universities: [],
      loadingUniversities: false,
      baseApiUrl: process.env.VUE_APP_BASE_API || ''
    }
  },
  computed: {
    ...mapState('upload', ['uploadLoading']),
    isCreate() {
      // 检查是否是创建新用户
      return !this.$route.params.userId && !this.$route.params.id
    }
  },
  created() {
    console.log('路由参数:', this.$route.params)
    console.log('API基础URL:', this.baseApiUrl)

    // 预加载大学列表
    this.fetchUniversities()

    // 如果是编辑模式，获取用户详情
    if (!this.isCreate) {
      this.getDetail()
    }
  },
  methods: {
    ...mapActions('upload', ['uploadFile']),
    // 处理头像URL
    // 在form.vue中更新这个方法
    getAvatarUrl(avatar) {
      if (!avatar) return '';

      // 检查是否已经是完整URL (以http或https开头)
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar;
      }

      // 处理静态资源目录中的图片
      if (avatar.startsWith('images/') || avatar.includes('assets/')) {
        // 使用webpack的require获取正确的路径
        // 对于存储在静态文件夹或公共目录中的图片
        return require('@/assets/' + avatar);
      }

      // 如果路径以/files/开头
      if (avatar.startsWith('/files/')) {
        return this.baseApiUrl + avatar;
      }

      // 如果路径以/开头
      if (avatar.startsWith('/')) {
        return this.baseApiUrl + avatar;
      }

      // 处理其他相对路径
      return this.baseApiUrl + '/files/' + avatar;
    },

    async handleAvatarUpload({ file }) {
      try {
        console.log('开始上传头像:', file);
        const response = await this.uploadFile({ file });
        console.log('上传响应:', response);

        if (response.code === 200) {
          // 确保头像URL是相对于API根路径的，而不是assets目录
          this.form.avatar = response.data;
          console.log('设置的头像URL:', this.form.avatar);
          this.$message.success('头像上传成功');
        } else {
          throw new Error(response.message || '上传失败');
        }
      } catch (error) {
        console.error('上传失败:', error);
        this.$message.error(error.message || '上传失败，请重试');
      }
    },
    async getDetail() {
      this.formLoading = true
      // 获取用户ID，兼容多种路由参数名
      const userId = this.$route.params.userId || this.$route.params.id
      console.log('获取用户详情, userId:', userId)

      if (!userId) {
        this.$message.error('用户ID不能为空')
        this.$router.push('/system/user/list')
        this.formLoading = false
        return
      }

      try {
        const response = await getUserDetail(userId)
        console.log('获取到的用户详情:', response)

        if (response.code === 200) {
          const userData = response.data
          console.log('用户数据:', userData)

          // 将用户数据赋值给表单
          this.form = {
            userId: userData.userId,
            username: userData.username,
            password: '',
            confirmPassword: '',
            email: userData.email,
            role: userData.role,
            avatar: userData.avatar,
            universityId: userData.universityId
          }

          console.log('表单数据设置为:', this.form)

          // 如果是高校管理员，确保已加载大学列表
          if (userData.role === 'university_admin') {
            console.log('用户是高校管理员，universityId:', userData.universityId)
            // 确保大学列表已加载
            if (this.universities.length === 0) {
              await this.fetchUniversities()
            }
          }
        } else {
          throw new Error(response.message || '获取用户详情失败')
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        this.$message.error(error.message || '获取用户信息失败')
        this.$router.push('/system/user/list')
      } finally {
        this.formLoading = false
      }
    },

    handleImageError() {
      console.error('图片加载失败:', this.form.avatar);
      console.log('尝试使用的URL:', this.getAvatarUrl(this.form.avatar));

      // 如果图片来自assets目录，可能是webpack路径问题
      if (this.form.avatar && (this.form.avatar.includes('assets/') || this.form.avatar.startsWith('src/assets/'))) {
        this.$message.warning('assets目录下的图片可能无法直接显示，但路径已保存');
      } else {
        this.$message.warning('图片加载可能有问题，但路径已保存');
      }
      // 不清空avatar值
    },

    beforeAvatarUpload(file) {
      console.log('准备上传文件:', file)
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
        this.submitting = true

        const submitData = { ...this.form }
        delete submitData.confirmPassword

        console.log('提交的表单数据:', submitData)

        if (this.isCreate) {
          const response = await createUser(submitData)
          console.log('创建用户响应:', response)

          if (response.code === 200) {
            this.$message.success('用户创建成功')
            this.$router.push('/system/user/list')
          } else {
            throw new Error(response.message || '创建失败')
          }
        } else {
          const response = await updateUser(this.form.userId, submitData)
          console.log('更新用户响应:', response)

          if (response.code === 200) {
            this.$message.success('更新成功')
            this.$router.push('/system/user/list')
          } else {
            throw new Error(response.message || '更新失败')
          }
        }
      } catch (error) {
        console.error('表单提交失败:', error)
        this.$message.error(error.message || '操作失败，请重试')
      } finally {
        this.submitting = false
      }
    },

    handleCancel() {
      this.$router.push('/system/user/list')
    },

    // 处理角色变更
    handleRoleChange(value) {
      console.log('角色变更为:', value)
      if (value === 'university_admin' && this.universities.length === 0) {
        this.fetchUniversities()
      }

      // 如果从高校管理员切换到其他角色，清空大学ID
      if (value !== 'university_admin') {
        this.form.universityId = undefined
      }
    },

    // 获取大学列表
    async fetchUniversities() {
      if (this.universities.length > 0) {
        return // 已加载过，不重复加载
      }

      this.loadingUniversities = true
      try {
        console.log('开始获取高校列表')
        const response = await getUniversityList({ page: 1, limit: 100 })
        console.log('获取到的高校列表响应:', response)

        if (response.code === 200) {
          this.universities = response.data.records || []
          console.log('高校列表:', this.universities)
        } else {
          throw new Error(response.message || '获取高校列表失败')
        }
      } catch (error) {
        console.error('获取高校列表失败:', error)
        this.$message.error('获取高校列表失败，请重试')
      } finally {
        this.loadingUniversities = false
      }
    }
  }
}
</script>

<style scoped>
.avatar-uploader {
  text-align: center;
}

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
