<template>
  <div class="register-container">
    <el-form ref="registerForm" :model="user" :rules="rules" class="register-form">
      <h3 class="title">用户注册</h3>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="user.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          :type="passwordType"
          v-model="user.password"
          placeholder="请输入密码"
        >
          <template #suffix>
            <span class="show-pwd" @click="togglePasswordVisibility">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          :type="passwordType"
          v-model="user.confirmPassword"
          placeholder="请确认密码"
        >
          <template #suffix>
            <span class="show-pwd" @click="togglePasswordVisibility">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="user.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-button type="primary" @click="handleRegister">注册</el-button>
      <el-button @click="goToLogin">已有账号？登录</el-button>
    </el-form>
  </div>
</template>

<script>
import { register } from '@/api/user'

export default {
  name: 'Register',
  data() {
    return {
      user: {
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
      },
      passwordType: 'password', // 控制密码输入框的类型（'password' 或 'text'）
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.user.password) {
                callback(new Error('两次密码输入不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          register(this.user)
            .then(() => {
              this.$message.success('注册成功，请登录！')
              this.$router.push('/login')
            })
            .catch(err => {
              this.$message.error(err.response?.data || '注册失败')
            })
        }
      })
    },
    goToLogin() {
      // this.$router.push('/login')
      this.$router.push({ name: 'Login' })
    },
    togglePasswordVisibility() {
      // 切换密码输入框的显示和隐藏
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.show-pwd {
  cursor: pointer;
  color: #999;
  font-size: 16px;
}

.show-pwd:hover {
  color: #666;
}
</style>
