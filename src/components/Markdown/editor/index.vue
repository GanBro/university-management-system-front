<template>
  <div :id="id" />
</template>

<script>
import 'tui-editor/dist/tui-editor.css'
import 'tui-editor/dist/tui-editor-contents.css'
import Editor from 'tui-editor'
import defaultOptions from './default-options'
import { uploadFile } from '@/api/upload' // 引入上传文件的接口

export default {
  name: 'WYSIWYGEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    id: {
      type: String,
      required: false,
      default() {
        return 'wysiwyg-editor-' + +new Date() + ((Math.random() * 1000).toFixed(0) + '')
      }
    },
    options: {
      type: Object,
      default() {
        return defaultOptions
      }
    },
    height: {
      type: String,
      required: false,
      default: '300px'
    },
    language: {
      type: String,
      required: false,
      default: 'zh_CN'
    }
  },
  data() {
    return {
      editor: null
    }
  },
  computed: {
    editorOptions() {
      const options = Object.assign({}, defaultOptions, this.options)
      options.initialEditType = 'wysiwyg'  // Always force WYSIWYG mode
      options.height = this.height
      options.language = this.language

      // 添加图片上传配置
      options.events = {
        addImageBlobHook: this.handleImageUpload
      }

      return options
    }
  },
  watch: {
    value(newValue, preValue) {
      if (newValue !== preValue && this.editor && newValue !== this.editor.getValue()) {
        this.editor.setValue(newValue)
      }
    },
    language(val) {
      if (this.editor) {
        this.destroyEditor()
        this.initEditor()
      }
    },
    height(newValue) {
      if (this.editor) {
        this.editor.height(newValue)
      }
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeDestroy() {
    this.destroyEditor()
  },
  methods: {
    initEditor() {
      this.editor = new Editor({
        el: document.getElementById(this.id),
        ...this.editorOptions
      })

      if (this.value) {
        this.editor.setValue(this.value)
      }

      this.editor.on('change', () => {
        this.$emit('input', this.editor.getValue())
      })
    },
    destroyEditor() {
      if (!this.editor) return
      this.editor.off('change')
      this.editor.remove()
    },
    setValue(value) {
      if (this.editor) {
        this.editor.setValue(value)
      }
    },
    getValue() {
      if (this.editor) {
        return this.editor.getValue()
      }
      return ''
    },
    setHtml(value) {
      if (this.editor) {
        this.editor.setHtml(value)
      }
    },
    getHtml() {
      if (this.editor) {
        return this.editor.getHtml()
      }
      return ''
    },
    // 处理图片上传
    async handleImageUpload(blob, callback) {
      try {
        const formData = new FormData()
        formData.append('file', blob)

        // 调用上传接口
        const res = await uploadFile(formData)
        const imageUrl = res.data // 获取上传后的图片URL

        // 将图片URL插入到Markdown编辑器中
        callback(imageUrl, '图片描述')
        this.$message.success('图片上传成功')
      } catch (error) {
        console.error('图片上传失败:', error)
        this.$message.error('图片上传失败')
      }
    }
  }
}
</script>
