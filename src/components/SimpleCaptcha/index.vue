<template>
  <div class="captcha-container">
    <canvas
      ref="captchaCanvas"
      :width="width"
      :height="height"
      @click="refreshCaptcha"
      class="captcha-canvas"
      title="点击刷新验证码"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: 'SimpleCaptcha',
  props: {
    width: {
      type: Number,
      default: 120
    },
    height: {
      type: Number,
      default: 40
    },
    length: {
      type: Number,
      default: 4
    }
  },
  data() {
    return {
      captchaText: ''
    }
  },
  mounted() {
    this.refreshCaptcha()
  },
  methods: {
    refreshCaptcha() {
      const canvas = this.$refs.captchaCanvas
      const ctx = canvas.getContext('2d')

      // 清空画布
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, this.width, this.height)

      // 生成随机验证码文本
      this.captchaText = this.generateCaptchaText()

      // 绘制干扰线
      this.drawInterferenceLines(ctx)

      // 绘制文本
      this.drawCaptchaText(ctx)

      // 通知父组件验证码已更新
      this.$emit('refresh', this.captchaText)
    },

    generateCaptchaText() {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      let result = ''
      for (let i = 0; i < this.length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length)
        result += chars.charAt(randomIndex)
      }
      return result
    },

    drawInterferenceLines(ctx) {
      // 绘制干扰线
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = this.getRandomColor(160, 200)
        ctx.beginPath()
        ctx.moveTo(Math.random() * this.width, Math.random() * this.height)
        ctx.lineTo(Math.random() * this.width, Math.random() * this.height)
        ctx.stroke()
      }

      // 绘制干扰点
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = this.getRandomColor(160, 200)
        ctx.beginPath()
        ctx.arc(Math.random() * this.width, Math.random() * this.height, 1, 0, 2 * Math.PI)
        ctx.fill()
      }
    },

    drawCaptchaText(ctx) {
      // 文字基本参数
      const fontSize = this.height * 0.6
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textBaseline = 'middle'

      // 计算文字间距
      const charWidth = this.width / (this.length + 1)

      // 绘制每个字符
      for (let i = 0; i < this.captchaText.length; i++) {
        const char = this.captchaText.charAt(i)

        // 随机颜色
        ctx.fillStyle = this.getRandomColor(10, 100)

        // 随机旋转角度
        const x = charWidth * (i + 1)
        const y = this.height / 2
        const angle = Math.random() * 0.4 - 0.2 // -0.2 到 0.2 弧度

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.fillText(char, -fontSize/4, 0)
        ctx.restore()
      }
    },

    getRandomColor(min, max) {
      const r = Math.floor(Math.random() * (max - min) + min)
      const g = Math.floor(Math.random() * (max - min) + min)
      const b = Math.floor(Math.random() * (max - min) + min)
      return `rgb(${r},${g},${b})`
    },

    // 获取当前验证码文本
    getCaptchaText() {
      return this.captchaText
    }
  }
}
</script>

<style scoped>
.captcha-container {
  display: inline-block;
}

.captcha-canvas {
  display: block;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}
</style>
