<template>
  <div class="markdown-editor">
    <div :id="id"></div>
  </div>
</template>

<script>
import '@toast-ui/editor/dist/toastui-editor.css'
import { Editor } from '@toast-ui/editor'
import { uploadFile } from '@/api/upload'

export default {
  name: 'MarkdownEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      default() {
        return 'markdown-editor-' + Date.now()
      }
    },
    height: {
      type: String,
      default: '400px'
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    }
  },
  data() {
    return {
      editor: null,
      editorOptions: {
        el: null,
        height: this.height,
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        placeholder: this.placeholder,
        language: 'zh-CN',
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          ['scrollSync']
        ],
        hooks: {
          addImageBlobHook: this.handleImageUpload
        }
      }
    }
  },
  watch: {
    value(newVal) {
      if (newVal !== this.editor.getMarkdown()) {
        this.editor.setMarkdown(newVal)
      }
    },
    height(newVal) {
      this.editor.setHeight(newVal)
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeDestroy() {
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    initEditor() {
      this.editorOptions.el = document.getElementById(this.id)
      this.editor = new Editor(this.editorOptions)

      // 设置初始内容
      if (this.value) {
        this.editor.setMarkdown(this.value)
      }

      // 监听内容变化
      this.editor.on('change', () => {
        const content = this.editor.getMarkdown()
        this.$emit('input', content)
        this.$emit('change', content)
      })
    },
    async handleImageUpload(file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await uploadFile(formData)
        if (response.code === 200) {
          return response.data
        } else {
          throw new Error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败：' + error.message)
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-editor {
  width: 100%;
  
  :deep(.toastui-editor-defaultUI) {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
  }
  
  :deep(.toastui-editor-defaultUI-toolbar) {
    border-bottom: 1px solid #dcdfe6;
  }
}
</style>
