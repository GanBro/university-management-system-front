<template>
  <div class="markdown-editor">
    <div :id="id" ref="editorEl"></div>
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
      isInitialized: false,
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
          addImageBlobHook: async(blob, callback) => {
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
        if (this.isInitialized && !this.isDestroying && newVal !== this.currentContent) {
          this.updateContent(newVal)
        }
      },
      // 不立即触发以避免在编辑器初始化前更新内容
      immediate: false
    },
    height(newVal) {
      if (this.editor && this.isInitialized && !this.isDestroying) {
        this.editor.setHeight(newVal)
      }
    }
  },
  mounted() {
    // 使用nextTick确保DOM已完全渲染
    this.$nextTick(() => {
      this.initEditor()
    })
  },
  beforeDestroy() {
    // 设置销毁标志，防止此后的操作
    this.isDestroying = true
    this.destroyEditor()
  },
  methods: {
    initEditor() {
      if (this.isDestroying) return

      // 如果编辑器已经存在，先安全销毁
      if (this.editor) {
        this.destroyEditor()
      }

      try {
        // 使用refs而不是getElementById
        // 确保在Vue的上下文中获取DOM元素
        const el = this.$refs.editorEl

        if (!el) {
          console.warn('找不到编辑器容器元素，将延迟初始化')
          setTimeout(() => this.initEditor(), 100)
          return
        }

        this.editorOptions.el = el
        this.editor = new Editor(this.editorOptions)

        if (this.isDestroying) {
          // 如果在创建过程中触发了销毁，则立即销毁编辑器
          this.destroyEditor()
          return
        }

        // 初始化内容
        this.updateContent(this.value)

        // 绑定更改事件
        this.editor.on('change', () => {
          if (this.isDestroying) return

          try {
            const content = this.editor.getMarkdown()
            this.currentContent = content
            this.$emit('input', content)
            this.$emit('change', content)
          } catch (error) {
            console.error('处理编辑器变更事件失败:', error)
          }
        })

        this.isInitialized = true
      } catch (error) {
        console.error('初始化编辑器失败:', error)
        this.isInitialized = false
      }
    },

    updateContent(content) {
      if (!this.editor || this.isDestroying || !this.isInitialized) return

      try {
        const newContent = content || ''

        // 避免不必要的更新
        if (this.currentContent === newContent) return

        this.currentContent = newContent
        this.editor.setMarkdown(newContent)
      } catch (error) {
        console.error('更新内容失败:', error)
      }
    },

    destroyEditor() {
      // 防止重复销毁
      if (!this.editor) return

      try {
        // 移除事件监听
        try {
          this.editor.off('change')
        } catch (e) {
          console.warn('移除事件监听失败:', e)
        }

        // 创建一个临时变量引用编辑器实例
        const editorInstance = this.editor

        // 立即清空引用，防止重复销毁
        this.editor = null
        this.currentContent = ''
        this.isInitialized = false

        // 销毁编辑器实例
        try {
          editorInstance.destroy()
        } catch (e) {
          console.warn('调用编辑器destroy方法失败:', e)
        }

        // 清空容器内容
        try {
          if (this.$refs.editorEl) {
            this.$refs.editorEl.innerHTML = ''
          }
        } catch (e) {
          console.warn('清空编辑器DOM失败:', e)
        }
      } catch (error) {
        console.error('销毁编辑器时出错:', error)
      }
    },

    async handleImageUpload(file) {
      if (this.isDestroying) return false

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
