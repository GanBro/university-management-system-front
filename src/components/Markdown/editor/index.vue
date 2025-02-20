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
        autofocus: false,
        initialValue: '',
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
        },
        events: {
          focus: () => {
            this.$emit('focus')
          },
          blur: () => {
            this.$emit('blur')
          }
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
      } else {
        this.editor.setMarkdown('') // 确保设置一个空字符串作为初始内容
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
    
    .toastui-editor-md-container {
      background-color: #fff;
      
      .toastui-editor {
        background-color: #fff;
      }
    }
    
    .toastui-editor-toolbar {
      border-bottom: 1px solid #dcdfe6;
      background-color: #f5f7fa;
    }
    
    .toastui-editor-main {
      .toastui-editor-md-preview {
        padding: 16px;
      }
      
      .toastui-editor-md-splitter {
        background-color: #dcdfe6;
      }
    }
    
    .toastui-editor-placeholder::before {
      color: #909399;
      font-style: normal;
    }
  }
  
  &:hover {
    :deep(.toastui-editor-defaultUI) {
      border-color: #c0c4cc;
    }
  }
  
  &:focus-within {
    :deep(.toastui-editor-defaultUI) {
      border-color: #409EFF;
    }
  }
}
</style>
