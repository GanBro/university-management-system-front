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
      currentContent: '',
      isDestroying: false,
      editorOptions: {
        el: null,
        height: this.height,
        initialEditType: 'markdown',
        previewStyle: 'vertical',
        placeholder: this.placeholder,
        language: 'zh-CN',
        autofocus: false,
        initialValue: this.value || '',
        toolbarItems: [
          ['heading', 'bold', 'italic', 'strike'],
          ['hr', 'quote'],
          ['ul', 'ol', 'task'],
          ['table', 'image', 'link'],
          ['code', 'codeblock'],
          ['scrollSync']
        ],
        hooks: {
          addImageBlobHook: async (blob, callback) => {
            try {
              const url = await this.handleImageUpload(blob)
              if (url) {
                callback(url, blob.name)
              }
            } catch (error) {
              console.error('图片处理失败:', error)
            }
          }
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
    value: {
      handler(newVal) {
        if (!this.isDestroying && newVal !== this.currentContent) {
          this.updateContent(newVal)
        }
      },
      immediate: true
    },
    height(newVal) {
      if (this.editor && !this.isDestroying) {
        this.editor.setHeight(newVal)
      }
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeDestroy() {
    this.isDestroying = true
    this.destroyEditor()
  },
  methods: {
    initEditor() {
      this.destroyEditor()
      
      this.$nextTick(() => {
        try {
          const el = document.getElementById(this.id)
          if (!el) {
            console.error('找不到编辑器容器元素')
            return
          }

          this.editorOptions.el = el
          this.editor = new Editor(this.editorOptions)
          
          if (!this.isDestroying) {
            this.updateContent(this.value)
            
            this.editor.on('change', () => {
              if (!this.isDestroying) {
                const content = this.editor.getMarkdown()
                this.currentContent = content
                this.$emit('input', content)
                this.$emit('change', content)
              }
            })
          }
        } catch (error) {
          console.error('初始化编辑器失败:', error)
        }
      })
    },
    updateContent(content) {
      if (this.editor && !this.isDestroying) {
        try {
          const newContent = content || ''
          this.currentContent = newContent
          this.editor.setMarkdown(newContent)
        } catch (error) {
          console.error('更新内容失败:', error)
        }
      }
    },
    destroyEditor() {
      if (this.editor) {
        try {
          this.editor.off('change')
          
          this.editor.setMarkdown('')
          
          this.editor.destroy()
          this.editor = null
          this.currentContent = ''
          
          const el = document.getElementById(this.id)
          if (el) {
            el.innerHTML = ''
          }
        } catch (error) {
          console.error('销毁编辑器时出错:', error)
        }
      }
    },
    async handleImageUpload(file) {
      try {
        const isImage = file.type.startsWith('image/')
        if (!isImage) {
          this.$message.error('只能上传图片文件')
          return false
        }

        const isLt5M = file.size / 1024 / 1024 < 5
        if (!isLt5M) {
          this.$message.error('图片大小不能超过 5MB!')
          return false
        }

        const formData = new FormData()
        formData.append('file', file)

        this.$message({
          message: '正在上传图片...',
          type: 'info',
          duration: 2000
        })

        const response = await uploadFile(formData)
        console.log('图片上传响应:', response)
        
        if (response.code === 200 && response.data) {
          let imageUrl = response.data.trim()
          
          imageUrl = imageUrl.replace(/^\/+/, '')
          
          const baseUrl = process.env.VUE_APP_BASE_API.replace(/\/+$/, '')
          
          const fullUrl = `${baseUrl}/${imageUrl}`
          
          console.log('最终图片URL:', fullUrl)
          
          const img = new Image()
          img.src = fullUrl
          
          try {
            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
              setTimeout(() => reject(new Error('图片加载超时')), 3000)
            })
            
            this.$message.success('图片上传成功')
            return fullUrl
          } catch (error) {
            console.error('图片验证失败:', error)
            throw new Error('图片链接无法访问，请检查网络连接')
          }
        } else {
          throw new Error(response.message || '上传失败')
        }
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败：' + (error.message || '未知错误'))
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
