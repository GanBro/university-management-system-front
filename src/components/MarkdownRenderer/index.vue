// src/components/MarkdownRenderer/index.vue
<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'MarkdownRenderer',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      renderer: new marked.Renderer()
    }
  },
  created() {
    // 配置 marked 选项
    marked.setOptions({
      renderer: this.renderer,
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // 允许回车换行
      pedantic: false,
      sanitize: false, // 不要在这里sanitize，我们使用DOMPurify
      smartLists: true,
      smartypants: true
    })

    // 自定义表格渲染
    this.renderer.table = (header, body) => {
      return `
        <div class="table-responsive">
          <table class="markdown-table">
            <thead>${header}</thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      `
    }

    // 自定义链接渲染
    this.renderer.link = (href, title, text) => {
      return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`
    }
  },
  computed: {
    renderedContent() {
      if (!this.content) return ''
      const rawHtml = marked(this.content)
      return DOMPurify.sanitize(rawHtml)
    }
  }
}
</script>

<style lang="scss" scoped>
.markdown-content {
  line-height: 1.6;
  color: #2c3e50;

  ::v-deep {
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    h4 { font-size: 1em; }

    p {
      margin: 1em 0;
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 1em 0;
    }

    li {
      margin: 0.5em 0;
    }

    .table-responsive {
      overflow-x: auto;
      margin: 1em 0;
    }

    .markdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;

      th, td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background-color: #f8f9fa;
        font-weight: 600;
      }

      tr:nth-child(even) {
        background-color: #f8f9fa;
      }

      tr:hover {
        background-color: #f5f5f5;
      }
    }

    blockquote {
      margin: 1em 0;
      padding: 0.5em 1em;
      border-left: 4px solid #42b983;
      background-color: #f8f9fa;
      color: #666;
    }

    code {
      padding: 0.2em 0.4em;
      font-size: 0.85em;
      background-color: #f8f9fa;
      border-radius: 3px;
      font-family: source-code-pro, Menlo, Monaco, Consolas, monospace;
    }

    pre {
      margin: 1em 0;
      padding: 1em;
      background-color: #f8f9fa;
      border-radius: 4px;
      overflow-x: auto;

      code {
        padding: 0;
        background-color: transparent;
      }
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1em auto;
    }

    hr {
      height: 1px;
      border: none;
      background-color: #ddd;
      margin: 2em 0;
    }
  }
}
</style>
