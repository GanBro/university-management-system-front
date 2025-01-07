<!--src/components/Markdown/editor/index.vue-->
<template>
  <div class="markdown-editor">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="编辑" name="edit">
        <el-input
          type="textarea"
          :rows="rows"
          v-model="content"
          :placeholder="placeholder"
          @input="handleInput"
        />
      </el-tab-pane>
      <el-tab-pane label="预览" name="preview">
        <div class="markdown-preview" v-html="compiledMarkdown"></div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'MarkdownEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    },
    rows: {
      type: Number,
      default: 15
    }
  },
  data() {
    return {
      activeTab: 'edit',
      content: this.value
    }
  },
  computed: {
    compiledMarkdown() {
      const rawHtml = marked(this.content || '')
      return DOMPurify.sanitize(rawHtml)
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.content) {
          this.content = val
        }
      },
      immediate: true
    }
  },
  methods: {
    handleInput(value) {
      this.$emit('input', value)
      this.$emit('change', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-editor {
  border: 1px solid #DCDFE6;
  border-radius: 4px;

  ::v-deep .el-tabs__header {
    margin: 0;
  }

  ::v-deep .el-tabs__content {
    padding: 15px;
  }

  .el-textarea {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  }

  .markdown-preview {
    padding: 10px;
    line-height: 1.6;
    font-size: 14px;

    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }

    h1, h2 {
      padding-bottom: 0.3em;
      border-bottom: 1px solid #eaecef;
    }

    ul, ol {
      padding-left: 2em;
      margin-bottom: 16px;
    }

    li {
      margin-bottom: 0.25em;
    }

    code {
      padding: 0.2em 0.4em;
      margin: 0;
      font-size: 85%;
      background-color: rgba(27,31,35,0.05);
      border-radius: 3px;
    }

    pre {
      padding: 16px;
      overflow: auto;
      font-size: 85%;
      line-height: 1.45;
      background-color: #f6f8fa;
      border-radius: 3px;
    }

    blockquote {
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
      margin: 0 0 16px 0;
    }

    table {
      border-collapse: collapse;
      margin: 0;
      padding: 0;
      width: 100%;

      tr {
        border-top: 1px solid #c6cbd1;
        background: #fff;

        &:nth-child(2n) {
          background-color: #f6f8fa;
        }
      }

      th, td {
        padding: 6px 13px;
        border: 1px solid #dfe2e5;
      }
    }
  }
}
</style>
