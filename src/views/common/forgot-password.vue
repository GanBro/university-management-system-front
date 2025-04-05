<template>
  <div class="forgot-password-container">
    <!-- 背景装饰元素 -->
    <div class="decoration-circle circle-1"></div>
    <div class="decoration-circle circle-2"></div>
    <div class="decoration-circle circle-3"></div>
    <div class="light-beam"></div>

    <div class="forgot-password-content">
      <div class="logo-container">
        <div class="logo-animation">
          <div class="logo-circle"></div>
        </div>
        <h1 class="app-name">全国高等院校管理系统</h1>
      </div>

      <div class="card-container">
        <h2 class="form-title">{{ currentStep === 1 ? '找回密码' : '重置密码' }}</h2>
        <p class="form-subtitle">{{ currentStep === 1 ? '我们将向您的邮箱发送验证码' : '请设置新的密码' }}</p>

        <!-- 步骤条 -->
        <el-steps :active="currentStep" finish-status="success" simple style="margin: 20px 0 30px;">
          <el-step title="验证身份"></el-step>
          <el-step title="重置密码"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>

        <!-- 步骤1: 验证身份 -->
        <div v-if="currentStep === 1">
          <el-form
            ref="verifyForm"
            :model="formData"
            :rules="verifyRules"
            class="forgot-password-form"
            @submit.native.prevent
          >
            <el-form-item prop="username">
              <div class="input-wrapper" :class="{'is-focused': activeField === 'username'}">
                <span class="icon-wrapper">
                  <svg-icon icon-class="user" />
                </span>
                <el-input
                  ref="username"
                  v-model="formData.username"
                  placeholder="请输入用户名"
                  name="username"
                  type="text"
                  tabindex="1"
                  @focus="handleFocus('username')"
                  @blur="handleBlur"
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <el-form-item prop="email">
              <div class="input-wrapper" :class="{'is-focused': activeField === 'email'}">
                <span class="icon-wrapper">
                  <i class="el-icon-message"></i>
                </span>
                <el-input
                  ref="email"
                  v-model="formData.email"
                  placeholder="请输入注册邮箱"
                  name="email"
                  type="email"
                  tabindex="2"
                  @focus="handleFocus('email')"
                  @blur="handleBlur"
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <el-form-item prop="verificationCode">
              <div class="verification-wrapper">
                <div class="input-wrapper verification-input" :class="{'is-focused': activeField === 'verificationCode'}">
                  <span class="icon-wrapper">
                    <i class="el-icon-key"></i>
                  </span>
                  <el-input
                    ref="verificationCode"
                    v-model="formData.verificationCode"
                    placeholder="验证码"
                    name="verificationCode"
                    type="text"
                    tabindex="3"
                    @focus="handleFocus('verificationCode')"
                    @blur="handleBlur"
                    class="custom-input"
                  />
                </div>
                <el-button
                  class="verification-btn"
                  type="primary"
                  :disabled="cooldown > 0"
                  @click="sendVerificationCode"
                >
                  {{ cooldown > 0 ? `${cooldown}s后重新获取` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>

            <div class="form-actions">
              <el-button
                :loading="loading"
                type="primary"
                class="submit-btn"
                @click.native.prevent="verifyIdentity"
              >
                <span class="btn-text">下一步</span>
                <i class="el-icon-arrow-right btn-icon"></i>
              </el-button>

              <el-button
                type="default"
                class="back-btn"
                @click.native.prevent="backToLogin"
              >
                <span>返回登录</span>
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 步骤2: 重置密码 -->
        <div v-if="currentStep === 2">
          <el-form
            ref="resetForm"
            :model="formData"
            :rules="resetRules"
            class="forgot-password-form"
            @submit.native.prevent
          >
            <el-form-item prop="newPassword">
              <div class="input-wrapper" :class="{'is-focused': activeField === 'newPassword'}">
                <span class="icon-wrapper">
                  <svg-icon icon-class="password" />
                </span>
                <el-input
                  ref="newPassword"
                  v-model="formData.newPassword"
                  placeholder="请输入新密码"
                  name="newPassword"
                  :type="passwordType"
                  tabindex="1"
                  @focus="handleFocus('newPassword')"
                  @blur="handleBlur"
                  class="custom-input"
                />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" class="eye-icon" />
                </span>
              </div>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <div class="input-wrapper" :class="{'is-focused': activeField === 'confirmPassword'}">
                <span class="icon-wrapper">
                  <svg-icon icon-class="password" />
                </span>
                <el-input
                  ref="confirmPassword"
                  v-model="formData.confirmPassword"
                  placeholder="请确认新密码"
                  name="confirmPassword"
                  :type="passwordType"
                  tabindex="2"
                  @focus="handleFocus('confirmPassword')"
                  @blur="handleBlur"
                  class="custom-input"
                />
              </div>
            </el-form-item>

            <div class="form-actions">
              <el-button
                :loading="loading"
                type="primary"
                class="submit-btn"
                @click.native.prevent="resetPassword"
              >
                <span class="btn-text">重置密码</span>
                <i class="el-icon-check btn-icon"></i>
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 步骤3: 完成 -->
        <div v-if="currentStep === 3" class="success-container">
          <i class="el-icon-success success-icon"></i>
          <h3 class="success-title">密码重置成功</h3>
          <p class="success-message">您可以使用新密码登录系统</p>
          <el-button
            type="primary"
            class="login-btn"
            @click.native.prevent="redirectToLogin"
          >
            <span>返回登录</span>
          </el-button>
        </div>

        <div class="security-tips" v-if="currentStep !== 3">
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
import { validateEmail } from '@/utils/validate'
import { requestPasswordReset, verifyResetCode, resetPassword } from '@/api/user'

export default {
  name: 'ForgotPassword',
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.formData.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    // 邮箱验证
    const validateUserEmail = (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'))
      } else {
        callback()
      }
    }

    return {
      currentStep: 1,
      loading: false,
      passwordType: 'password',
      activeField: null,
      cooldown: 0,
      cooldownInterval: null,
      formData: {
        username: '',
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: '',
        resetToken: '' // 用于验证身份成功后的令牌
      },
      verifyRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: validateUserEmail, trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '验证码长度应为6位', trigger: 'blur' }
        ]
      },
      resetRules: {
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度必须大于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleFocus(field) {
      this.activeField = field
    },
    handleBlur() {
      this.activeField = null
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
      this.$nextTick(() => {
        if (this.currentStep === 2) {
          this.$refs.newPassword.focus()
        }
      })
    },
    // 发送验证码
    sendVerificationCode() {
      this.$refs.verifyForm.validateField(['username', 'email'], (valid) => {
        if (!valid) {
          // 如果用户名和邮箱验证通过
          this.loading = true

          requestPasswordReset({
            username: this.formData.username,
            email: this.formData.email
          }).then(response => {
            this.loading = false
            // 开始倒计时
            this.startCooldown()

            this.$notify({
              title: '验证码已发送',
              message: '验证码已发送至您的邮箱，请注意查收',
              type: 'success',
              duration: 3000
            })
          }).catch(error => {
            this.loading = false
            this.$notify({
              title: '发送失败',
              message: error.message || '验证码发送失败，请检查用户名和邮箱是否匹配',
              type: 'error',
              duration: 4000
            })
          })
        }
      })
    },
    // 验证身份
    verifyIdentity() {
      this.$refs.verifyForm.validate(valid => {
        if (valid) {
          this.loading = true

          verifyResetCode({
            username: this.formData.username,
            email: this.formData.email,
            code: this.formData.verificationCode
          }).then(response => {
            this.loading = false
            // 保存重置令牌
            this.formData.resetToken = response.data.resetToken
            // 进入下一步
            this.currentStep = 2
          }).catch(error => {
            this.loading = false
            this.$notify({
              title: '验证失败',
              message: error.message || '验证码验证失败，请检查后重试',
              type: 'error',
              duration: 4000
            })
          })
        }
      })
    },
    // 重置密码
    resetPassword() {
      this.$refs.resetForm.validate(valid => {
        if (valid) {
          this.loading = true

          resetPassword({
            username: this.formData.username,
            resetToken: this.formData.resetToken,
            newPassword: this.formData.newPassword
          }).then(response => {
            this.loading = false
            // 进入成功页面
            this.currentStep = 3
          }).catch(error => {
            this.loading = false
            this.$notify({
              title: '重置失败',
              message: error.message || '密码重置失败，请稍后重试',
              type: 'error',
              duration: 4000
            })
          })
        }
      })
    },
    // 返回登录页
    backToLogin() {
      // 添加离场动画
      document.querySelector('.forgot-password-content').classList.add('fade-out')

      // 延迟跳转，等待动画完成
      setTimeout(() => {
        this.$router.push('/login')
      }, 400)
    },
    // 重置成功后返回登录页
    redirectToLogin() {
      this.$router.push('/login')
    },
    // 开始倒计时
    startCooldown() {
      this.cooldown = 60
      clearInterval(this.cooldownInterval)
      this.cooldownInterval = setInterval(() => {
        if (this.cooldown > 0) {
          this.cooldown--
        } else {
          clearInterval(this.cooldownInterval)
        }
      }, 1000)
    }
  },
  mounted() {
    // 添加入场动画
    document.querySelector('.forgot-password-content').classList.add('fade-in')
  },
  beforeDestroy() {
    clearInterval(this.cooldownInterval)
  }
}
</script>

<style lang="scss" scoped>
/* --- 基础样式 --- */
.forgot-password-container {
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

.forgot-password-content {
  width: 90%;
  max-width: 460px;
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
  margin: 0 0 20px;
  font-weight: 400;
}

/* --- 表单和输入框样式 --- */
.forgot-password-form {
  margin-bottom: 15px;
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

.verification-wrapper {
  display: flex;
  gap: 10px;
}

.verification-input {
  flex: 1;
}

.verification-btn {
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(to right, #0071e3, #40a9ff);
  border: none;
  min-width: 120px;
}

.verification-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #0060c0, #1890ff);
  box-shadow: 0 4px 8px rgba(0, 113, 227, 0.2);
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

/* --- 按钮样式 --- */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.submit-btn, .login-btn {
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

.submit-btn:hover, .login-btn:hover {
  background: linear-gradient(to right, #0060c0, #1890ff);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 113, 227, 0.3);
}

.submit-btn:active, .login-btn:active {
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

.back-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid #d2d2d7;
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background-color: rgba(0, 0, 0, 0.03);
  border-color: #b0b0b0;
  color: #1d1d1f;
}

/* --- 成功页面 --- */
.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.success-icon {
  font-size: 64px;
  color: #34c759;
  margin-bottom: 20px;
}

.success-title {
  font-size: 24px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 10px;
}

.success-message {
  font-size: 16px;
  color: #86868b;
  margin: 0 0 30px;
  text-align: center;
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

  .verification-btn {
    min-width: 100px;
  }
}
</style>

