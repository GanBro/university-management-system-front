<!-- src/components/ImageHandler/index.vue -->
<template>
  <el-avatar
    :size="size"
    :src="imageUrl"
    :icon="icon || 'el-icon-user'"
    @error="handleError"
  ></el-avatar>
</template>

<script>
export default {
  name: 'ImageHandler',
  props: {
    src: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 32
    },
    icon: {
      type: String,
      default: 'el-icon-user'
    }
  },
  computed: {
    imageUrl() {
      if (!this.src) return ''
      if (this.src.startsWith('http')) {
        return this.src
      }
      // 如果是本地图片路径，需要使用 require 加载
      if (this.src.startsWith('images/')) {
        try {
          return require('@/assets/' + this.src)
        } catch (error) {
          console.warn('Image not found:', this.src)
          return ''
        }
      }
      return this.src
    }
  },
  methods: {
    handleError() {
      this.$emit('error')
      console.warn('Image load failed:', this.src)
    }
  }
}
</script>
