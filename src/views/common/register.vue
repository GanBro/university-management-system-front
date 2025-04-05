<template>
  <div class="register-container">
    <div class="register-content">
      <div class="logo-container">
        <div class="logo-animation">
          <div class="logo-circle"></div>
          <h1 class="app-name">全国高等院校管理系统</h1>
        </div>
      </div>

      <div class="card-container">
        <h2 class="form-title">创建您的账号</h2>
        <p class="form-subtitle">填写以下信息完成注册</p>

        <el-form
          ref="registerForm"
          :model="user"
          :rules="rules"
          class="register-form"
          @submit.native.prevent
        >
          <el-form-item prop="username">
            <el-input
              v-model="user.username"
              placeholder="用户名"
              class="custom-input"
              prefix-icon="el-icon-user"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              :type="passwordType"
              v-model="user.password"
              placeholder="密码"
              class="custom-input"
              prefix-icon="el-icon-lock"
              @focus="handleFocus"
              @blur="handleBlur"
            >
              <template #suffix>
                <span class="toggle-password" @click="togglePasswordVisibility">
                  <i :class="passwordType === 'password' ? 'el-icon-view' : 'el-icon-hide'"></i>
                </span>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              :type="passwordType"
              v-model="user.confirmPassword"
              placeholder="确认密码"
              class="custom-input"
              prefix-icon="el-icon-lock"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              v-model="user.email"
              placeholder="电子邮箱"
              class="custom-input"
              prefix-icon="el-icon-message"
              @focus="handleFocus"
              @blur="handleBlur"
            />
          </el-form-item>

          <el-form-item prop="captcha" class="captcha-item">
            <div class="captcha-container">
              <el-input
                v-model="user.captcha"
                placeholder="验证码"
                class="captcha-input custom-input"
                @focus="handleFocus"
                @blur="handleBlur"
              />
              <div class="captcha-wrapper" @click="refreshCaptcha" title="点击刷新验证码">
                <simple-captcha
                  ref="simpleCaptcha"
                  @refresh="onCaptchaRefresh"
                  width="120"
                  height="44"
                  class="captcha-component"
                />
              </div>
            </div>
          </el-form-item>

          <div class="form-action">
            <el-button
              type="primary"
              class="submit-btn"
              :loading="loading"
              @click="handleRegister"
              :disabled="!formValid"
            >
              <span class="btn-text">注册</span>
              <i class="el-icon-arrow-right btn-icon"></i>
            </el-button>
          </div>
        </el-form>

        <div class="login-link">
          <p>已有账号？<el-link type="primary" @click="goToLogin" class="custom-link">登录</el-link></p>
        </div>

        <div class="privacy-notice">
          <p>注册即表示您同意我们的<el-link type="primary" class="custom-link">服务条款</el-link>和<el-link type="primary" class="custom-link">隐私政策</el-link></p>
        </div>
      </div>
    </div>

    <!-- 背景装饰元素 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>
    <div class="decoration-circle circle-3"></div>
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
    // 自定义验证器
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
      formValid: false,
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
  watch: {
    // 监听表单的变化来更新按钮状态
    user: {
      deep: true,
      handler() {
        this.$refs.registerForm && this.$refs.registerForm.validate(valid => {
          this.formValid = valid
        })
      }
    }
  },
  methods: {
    handleFocus(event) {
      // 添加焦点动画类
      event.target.parentNode.classList.add('input-focused')
    },
    handleBlur(event) {
      // 移除焦点动画类
      event.target.parentNode.classList.remove('input-focused')
    },
    togglePasswordVisibility() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
      // 在下一个tick聚焦回密码字段
      this.$nextTick(() => {
        document.querySelector('input[type="' + this.passwordType + '"]').focus()
      })
    },
    refreshCaptcha() {
      // 添加刷新动画
      const captchaWrapper = document.querySelector('.captcha-wrapper')
      captchaWrapper.classList.add('refreshing')

      // 调用验证码组件的刷新方法
      this.$refs.simpleCaptcha.refreshCaptcha()

      // 动画完成后移除类
      setTimeout(() => {
        captchaWrapper.classList.remove('refreshing')
      }, 500)
    },
    onCaptchaRefresh(captchaText) {
      // 存储新生成的验证码文本
      this.currentCaptcha = captchaText
      // 清空用户输入的验证码
      this.user.captcha = ''
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 使用API服务注册
          const { captcha, confirmPassword, ...userData } = this.user

          register(userData)
            .then(() => {
              this.$notify({
                title: '成功',
                message: '注册成功，请登录！',
                type: 'success',
                customClass: 'custom-notification',
                duration: 3000
              })

              // 添加一个延迟，让用户有时间看到成功消息
              setTimeout(() => {
                this.$router.push('/login')
              }, 1500)
            })
            .catch(err => {
              this.$notify({
                title: '注册失败',
                message: err.response?.data?.message || '注册失败，请稍后重试',
                type: 'error',
                customClass: 'custom-notification',
                duration: 4000
              })
              // 刷新验证码
              this.refreshCaptcha()
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    goToLogin() {
      // 添加一些过渡效果
      document.querySelector('.register-content').classList.add('fade-out')

      setTimeout(() => {
        this.$router.push({ name: 'Login' })
      }, 300)
    }
  },
  mounted() {
    // 添加入场动画
    document.querySelector('.register-content').classList.add('fade-in')

    // 初始验证表单状态
    this.$nextTick(() => {
      this.$refs.registerForm.validate(valid => {
        this.formValid = valid
      })
    })
  }
}
</script>

<style scoped>
/* --- 基础样式 --- */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%);
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.register-content {
  width: 90%;
  max-width: 420px;
  margin: 20px;
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.fade-out {
  opacity: 0;
  transform: translateY(-20px);
}

/* --- 装饰性背景圆 --- */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  z-index: 1;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #5471ff, #73baf7);
  top: -250px;
  left: -250px;
}

.circle-2 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #4c6fff, #6cd4ff);
  bottom: -300px;
  right: -250px;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #73baf7, #9f86ff);
  top: 60%;
  left: 15%;
}

/* --- Logo 和标题样式 --- */
.logo-container {
  text-align: center;
  margin-bottom: 30px;
}

.logo-animation {
  display: inline-block;
  position: relative;
}

.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007aff, #5856d6);
  margin: 0 auto 15px;
  box-shadow: 0 6px 12px rgba(0, 122, 255, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(0, 122, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
  }
}

.app-name {
  font-size: 24px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.5px;
}

/* --- 卡片容器 --- */
.card-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 35px 30px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05),
  0 4px 6px rgba(0, 0, 0, 0.03),
  0 0 1px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 28px;
  color: #1d1d1f;
  font-weight: 600;
  margin: 0 0 8px;
  text-align: center;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 16px;
  color: #86868b;
  text-align: center;
  margin: 0 0 30px;
  font-weight: 400;
}

/* --- 表单样式 --- */
.register-form {
  margin-bottom: 20px;
}

.custom-input ::v-deep(.el-input__inner) {
  height: 48px;
  border-radius: 10px;
  border: 1px solid #d2d2d7;
  background-color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  transition: all 0.3s;
  padding-left: 15px;
}

.custom-input ::v-deep(.el-input__inner:focus) {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
}

.custom-input ::v-deep(.el-input__prefix) {
  left: 15px;
  color: #86868b;
}

.custom-input ::v-deep(.el-input__prefix i) {
  font-size: 18px;
}

.custom-input ::v-deep(.el-input__inner::-webkit-input-placeholder) {
  color: #86868b;
  font-size: 16px;
}

/* 聚焦动画 */
.input-focused ::v-deep(.el-input__inner) {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
  transform: translateY(-2px);
}

/* 验证码样式 */
.captcha-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.captcha-input {
  flex: 1;
}

.captcha-wrapper {
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.captcha-wrapper:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.captcha-component {
  display: block;
  transition: transform 0.3s ease;
}

.refreshing .captcha-component {
  transform: rotate(360deg);
}

/* 密码可见性切换 */
.toggle-password {
  cursor: pointer;
  color: #86868b;
  transition: color 0.2s ease;
  font-size: 18px;
  margin-right: 8px;
}

.toggle-password:hover {
  color: #0071e3;
}

/* 按钮样式 */
.form-action {
  margin-top: 35px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(to right, #0071e3, #40a9ff);
  border: none;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.submit-btn:hover {
  background: linear-gradient(to right, #0060c0, #1890ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 113, 227, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 8px rgba(0, 113, 227, 0.2);
}

.btn-text {
  transition: transform 0.3s ease;
}

.btn-icon {
  margin-left: 5px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.submit-btn:hover .btn-text {
  transform: translateX(-10px);
}

.submit-btn:hover .btn-icon {
  opacity: 1;
  transform: translateX(0);
}

.submit-btn[disabled] {
  background: linear-gradient(to right, #97c4ea, #b3d8ff);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* 登录链接和隐私提示 */
.login-link {
  margin-top: 25px;
  text-align: center;
  font-size: 15px;
  color: #1d1d1f;
}

.privacy-notice {
  margin-top: 15px;
  text-align: center;
  font-size: 13px;
  color: #86868b;
  line-height: 1.4;
}

.custom-link {
  font-weight: 500;
  color: #0071e3;
  text-decoration: none;
  transition: color 0.2s;
}

.custom-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* --- 响应式适配 --- */
@media (max-width: 480px) {
  .card-container {
    padding: 25px 20px;
  }

  .form-title {
    font-size: 24px;
  }

  .form-subtitle {
    font-size: 14px;
  }

  .custom-input ::v-deep(.el-input__inner) {
    height: 44px;
    font-size: 15px;
  }

  .captcha-wrapper {
    transform: scale(0.9);
  }
}

/* 确保表单项之间有足够间距 */
::v-deep(.el-form-item) {
  margin-bottom: 20px;
}

::v-deep(.el-form-item__error) {
  padding-top: 4px;
  color: #ff453a;
  font-size: 13px;
}

/* 自定义通知样式 */
:global(.custom-notification) {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
