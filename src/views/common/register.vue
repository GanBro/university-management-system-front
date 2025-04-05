// src/views/common/register.vue
<template>
  <div class="register-container">
    <el-card class="register-card">
      <div slot="header" class="card-header">
        <h2 class="title">用户注册</h2>
      </div>

      <el-form ref="registerForm" :model="user" :rules="rules" class="register-form" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="user.username"
            placeholder="请输入用户名"
            prefix-icon="el-icon-user"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            :type="passwordType"
            v-model="user.password"
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
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
            prefix-icon="el-icon-lock"
          >
            <template #suffix>
              <span class="show-pwd" @click="togglePasswordVisibility">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
              </span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="user.email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
          />
        </el-form-item>

        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="user.captcha"
              placeholder="请输入验证码"
              class="captcha-input"
            />
            <div class="captcha-image">
              <simple-captcha
                ref="simpleCaptcha"
                @refresh="onCaptchaRefresh"
              />
            </div>
          </div>
        </el-form-item>

        <div class="form-actions">
          <el-button type="primary" class="submit-btn" @click="handleRegister" :loading="loading">注册</el-button>
          <div class="login-link">
            已有账号？<el-link type="primary" @click="goToLogin">立即登录</el-link>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { register } from '@/api/user'
import SimpleCaptcha from '@/components/SimpleCaptcha'

export default {
  name: 'Register',
  components: {
    SimpleCaptcha
  },
  data() {
    // 自定义验证码验证规则
    const validateCaptcha = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入验证码'))
      }
      if (value.toUpperCase() !== this.currentCaptcha.toUpperCase()) {
        return callback(new Error('验证码不正确'))
      }
      callback()
    }

    return {
      user: {
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        captcha: ''
      },
      loading: false,
      passwordType: 'password',
      currentCaptcha: '', // 存储当前验证码
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度应在3到20个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
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
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { validator: validateCaptcha, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 不需要在这里创建新对象，直接使用user对象
          // register函数内部已经处理了验证码字段的剔除
          register(this.user)
            .then(() => {
              this.$notify({
                title: '成功',
                message: '注册成功，请登录！',
                type: 'success',
                duration: 2000
              })
              setTimeout(() => {
                this.$router.push('/login')
              }, 2000)
            })
            .catch(err => {
              this.$notify({
                title: '错误',
                message: err.response?.data?.message || '注册失败，请稍后重试',
                type: 'error'
              })
              // 刷新验证码
              this.refreshCaptcha()
            })
            .finally(() => {
              this.loading = false
            })
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    },
    goToLogin() {
      this.$router.push({ name: 'Login' })
    },
    togglePasswordVisibility() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
    },
    refreshCaptcha() {
      // 调用验证码组件的刷新方法
      this.$refs.simpleCaptcha.refreshCaptcha()
    },
    onCaptchaRefresh(captchaText) {
      // 存储新生成的验证码文本
      this.currentCaptcha = captchaText
      // 清空用户输入的验证码
      this.user.captcha = ''
    }
  },
  created() {
    // 初始验证码将在组件挂载时自动生成
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.register-card {
  width: 480px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.title {
  margin: 0;
  font-size: 22px;
  color: #303133;
  font-weight: 500;
}

.register-form {
  padding: 10px 20px 30px;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-input {
  flex: 1;
  margin-right: 10px;
}

.captcha-image {
  height: 40px;
  display: flex;
  align-items: center;
}

.form-actions {
  margin-top: 30px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  margin-bottom: 15px;
  font-size: 16px;
  padding: 12px 0;
}

.login-link {
  margin-top: 15px;
  font-size: 14px;
  color: #606266;
}

.show-pwd {
  cursor: pointer;
  color: #c0c4cc;
}

.show-pwd:hover {
  color: #409eff;
}
</style>
