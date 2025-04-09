<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>
    <div class="decoration-circle circle-3"></div>
    <div class="light-beam"></div>

    <div class="login-content">
      <div class="logo-container">
        <div class="logo-animation">
          <div class="logo-circle"></div>
        </div>
        <h1 class="app-name">全国高等院校管理系统</h1>
      </div>

      <div class="card-container">
        <h2 class="form-title">欢迎回来</h2>
        <p class="form-subtitle">登录您的账号继续使用</p>

        <el-form
          ref="loginForm"
          :model="user"
          :rules="loginRules"
          class="login-form"
          @submit.native.prevent
        >
          <el-form-item prop="username">
            <div class="input-wrapper" :class="{'is-focused': activeField === 'username'}">
              <span class="icon-wrapper">
                <svg-icon icon-class="user" />
              </span>
              <el-input
                ref="username"
                v-model="user.username"
                placeholder="请输入用户名"
                name="username"
                type="text"
                tabindex="1"
                auto-complete="on"
                @focus="handleFocus('username')"
                @blur="handleBlur"
                class="custom-input"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper" :class="{'is-focused': activeField === 'password'}">
              <span class="icon-wrapper">
                <svg-icon icon-class="password" />
              </span>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="user.password"
                :type="passwordType"
                placeholder="请输入密码"
                name="password"
                tabindex="2"
                auto-complete="on"
                @keyup.enter.native="handleLogin"
                @focus="handleFocus('password')"
                @blur="handleBlur"
                class="custom-input"
              />
              <span class="show-pwd" @click="showPwd">
                <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" class="eye-icon" />
              </span>
            </div>
          </el-form-item>

          <div class="remember-forgot">
            <el-checkbox v-model="rememberMe" class="remember-me">记住我</el-checkbox>
            <el-link class="forgot-password" type="primary" @click="handleForgotPassword">忘记密码?</el-link>
          </div>

          <div class="form-actions">
            <el-button
              :loading="loading"
              type="primary"
              class="submit-btn"
              @click.native.prevent="handleLogin"
              :disabled="!formValid"
            >
              <span class="btn-text">登录</span>
              <i class="el-icon-arrow-right btn-icon"></i>
            </el-button>

            <el-button
              type="default"
              class="register-btn"
              @click.native.prevent="handleRegister"
            >
              <span>注册新账号</span>
            </el-button>
          </div>
        </el-form>

        <div class="security-tips">
          <i class="el-icon-lock"></i>
          <span>使用安全加密连接保护您的账号信息</span>
        </div>
      </div>

      <div class="footer-info">
        <p>© 2025 高等院校信息管理系统 · <el-link class="footer-link" type="primary">隐私政策</el-link> · <el-link class="footer-link" type="primary">服务条款</el-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error('请输入用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码长度必须大于6位'))
      } else {
        callback()
      }
    }
    return {
      user: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined,
      rememberMe: false,
      activeField: null,
      formValid: false
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    },
    user: {
      deep: true,
      handler() {
        // 验证表单有效性来更新按钮状态
        this.$refs.loginForm && this.$refs.loginForm.validate(valid => {
          this.formValid = valid
        })
      }
    }
  },
  created() {
    // 页面创建时移除token
    this.$store.dispatch('user/resetToken')
  },
  mounted() {
    // 添加入场动画
    document.querySelector('.login-content').classList.add('fade-in')

    // 初始验证表单状态
    this.$nextTick(() => {
      this.$refs.loginForm.validate(valid => {
        this.formValid = valid
      })
    })

    // 添加键盘回车事件监听
    window.addEventListener('keyup', this.handleKeyUp)
  },
  beforeDestroy() {
    // 移除事件监听
    window.removeEventListener('keyup', this.handleKeyUp)
  },
  methods: {
    handleFocus(field) {
      this.activeField = field
    },
    handleBlur() {
      this.activeField = null
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = 'text'
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleKeyUp(e) {
      // 监听回车键
      if (e.key === 'Enter') {
        this.handleLogin()
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 添加登录按钮动画
          const loginBtn = document.querySelector('.submit-btn')
          loginBtn.classList.add('button-pulse')

          this.$store.dispatch('user/login', this.user)
            .then(() => {
              return this.$store.dispatch('user/getInfo')
            })
            .then((data) => {
              const { role } = data.user || data
              this.loading = false

              // 成功登录通知
              this.$notify({
                title: '登录成功',
                message: '欢迎回来，即将跳转...',
                type: 'success',
                duration: 2000,
                customClass: 'login-notification'
              })

              // 延迟跳转，给通知一些显示时间
              setTimeout(() => {
                if (role === 'admin') {
                  this.$router.push({ path: '/', replace: true })
                } else {
                  this.$router.push({ path: '/user/home', replace: true })
                }
              }, 800)
            })
            .catch(error => {
              this.loading = false
              loginBtn.classList.remove('button-pulse')

              this.$notify({
                title: '登录失败',
                message: error.message || '用户名或密码错误，请重试',
                type: 'error',
                duration: 4000,
                customClass: 'login-notification'
              })
            })
        }
      })
    },
    handleRegister() {
      // 添加离场动画
      document.querySelector('.login-content').classList.add('fade-out')

      // 延迟跳转，等待动画完成
      setTimeout(() => {
        this.$router.push('/register')
      }, 400)
    },

    handleForgotPassword() {
      // 添加离场动画
      document.querySelector('.login-content').classList.add('fade-out')

      // 延迟跳转，等待动画完成
      setTimeout(() => {
        this.$router.push('/forgot-password')
      }, 400)
    }
  }
}
</script>

<style lang="scss" scoped>
/* --- 基础样式 --- */
/* --- 基础样式 --- */
.login-container {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f0f4f8 0%, #f5f7fa 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.login-content {
  width: 90%;
  max-width: 420px;
  margin: 0 auto;
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

/* --- 装饰性背景效果 --- */
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
  right: -150px;
}

.circle-2 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #4c6fff, #6cd4ff);
  bottom: -300px;
  left: -150px;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #73baf7, #9f86ff);
  top: 40%;
  right: 25%;
}

.light-beam {
  position: absolute;
  width: 300px;
  height: 100vh;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
  transform: rotate(45deg);
  top: -50%;
  left: 20%;
  z-index: 1;
  animation: beam-move 8s ease-in-out infinite alternate;
}

@keyframes beam-move {
  0% {
    transform: rotate(45deg) translateX(-100px);
    opacity: 0.1;
  }
  100% {
    transform: rotate(45deg) translateX(100px);
    opacity: 0.2;
  }
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
  font-size: 22px;
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
  margin-bottom: 20px;
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

/* --- 表单和输入框样式 --- */
.login-form {
  margin-bottom: 15px;
  width: 100%; /* 确保表单占满容器宽度 */
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #d2d2d7;
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-wrapper.is-focused {
  border-color: #0071e3;
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);
  transform: translateY(-2px);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  color: #86868b;
}

.custom-input {
  flex: 1;
}

::v-deep(.el-input__inner) {
  height: 48px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #1d1d1f;
  padding-left: 0;
}

::v-deep(.el-input__inner:focus) {
  box-shadow: none;
}

.show-pwd {
  padding: 0 15px;
  color: #86868b;
  cursor: pointer;
  transition: color 0.2s;
}

.show-pwd:hover {
  color: #0071e3;
}

.eye-icon {
  font-size: 18px;
}

/* --- 记住我和忘记密码 --- */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 30px;
  color: #1d1d1f;
}

.remember-me {
  font-size: 14px;
}

::v-deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #0071e3;
  border-color: #0071e3;
}

::v-deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #1d1d1f;
}

.forgot-password {
  font-size: 14px;
  font-weight: 500;
  color: #0071e3;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

/* --- 按钮样式 --- */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%; /* 确保按钮容器占满宽度 */
  box-sizing: border-box; /* 确保padding不会增加总宽度 */
}

.submit-btn, .register-btn {
  width: 100%; /* 确保两个按钮宽度相同 */
  height: 50px; /* 统一按钮高度 */
  border-radius: 12px; /* 统一圆角 */
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex; /* 统一使用flex布局 */
  align-items: center;
  justify-content: center;
  padding: 0; /* 移除内边距避免影响对齐 */
  margin: 0; /* 移除外边距避免影响对齐 */
  box-sizing: border-box; /* 确保边框包含在宽度内 */
}

.submit-btn {
  background: linear-gradient(to right, #0071e3, #40a9ff);
  border: none;
  font-size: 17px;
  letter-spacing: 0.5px;
  color: white;
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

.submit-btn.button-pulse {
  animation: button-pulse 1.5s infinite;
}

@keyframes button-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 113, 227, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 113, 227, 0);
  }
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

.register-btn {
  background: transparent;
  border: 1px solid #d2d2d7;
  font-size: 16px;
  color: #1d1d1f;
}

.register-btn:hover {
  background-color: rgba(0, 0, 0, 0.03);
  border-color: #b0b0b0;
  color: #1d1d1f;
}

/* --- 安全提示 --- */
.security-tips {
  text-align: center;
  margin-top: 25px;
  font-size: 13px;
  color: #86868b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.security-tips i {
  margin-right: 6px;
  font-size: 14px;
}

/* --- 页脚 --- */
.footer-info {
  text-align: center;
  margin-top: 30px;
  font-size: 13px;
  color: #86868b;
}

.footer-link {
  font-weight: 400;
  color: #86868b;
}

.footer-link:hover {
  color: #0071e3;
}

/* --- 表单项和错误消息 --- */
::v-deep(.el-form-item) {
  margin-bottom: 20px;
  width: 100%; /* 确保表单项占满容器宽度 */
}

::v-deep(.el-form-item__error) {
  padding-top: 4px;
  color: #ff453a;
  font-size: 13px;
}

/* --- 响应式设计 --- */
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

  ::v-deep(.el-input__inner) {
    height: 44px;
    font-size: 15px;
  }
}

/* 自定义通知样式 */
:global(.login-notification) {
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
