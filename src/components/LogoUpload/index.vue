<!-- src/components/LogoUpload/index.vue -->
<template>
  <div class="logo-upload">
    <el-upload
      class="logo-uploader"
      :action="`${process.env.VUE_APP_BASE_API}/upload/logo`"
      :headers="headers"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :on-error="handleError"
    >
      <img v-if="value" :src="value" class="logo">
      <i v-else class="el-icon-plus logo-uploader-icon"></i>
    </el-upload>
    <div class="upload-tip">建议上传比例1:1的PNG、JPG格式图片</div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'

export default {
  name: 'LogoUpload',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    headers() {
      return {
        'X-Token': getToken()
      }
    }
  },
  methods: {
    handleSuccess(res) {
      if (res.code === 200) {
        this.$emit('input', res.data)
        this.$emit('success', res.data)
        this.$message.success('上传成功')
      } else {
        this.$message.error(res.message || '上传失败')
      }
    },
    handleError(err) {
      console.error('Logo上传失败:', err)
      this.$message.error('Logo上传失败，请重试')
    },
    beforeUpload(file) {
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPGOrPNG) {
        this.$message.error('Logo只能是JPG或PNG格式!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('Logo大小不能超过2MB!')
        return false
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.logo-upload {
  .logo-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 120px;
    height: 120px;

    &:hover {
      border-color: #409EFF;
    }

    .logo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 120px;
      height: 120px;
      line-height: 120px;
      text-align: center;
    }

    .logo {
      width: 120px;
      height: 120px;
      display: block;
      object-fit: contain;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    text-align: center;
  }
}
</style>
