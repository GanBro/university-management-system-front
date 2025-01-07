<!--src/components/Markdown/viewer/index.vue-->
<template>
  <div class="markdown-viewer" v-html="compiledMarkdown"></div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'MarkdownViewer',
  props: {
    content: {
      type: String,
      default: ''
    }
  },
  computed: {
    compiledMarkdown() {
      if (!this.content) return ''
      const rawHtml = marked(this.content || '')
      return DOMPurify.sanitize(rawHtml)
    }
  }
}
</script>

<style lang="scss">
.markdown-viewer {
  line-height: 1.6;
  font-size: 14px;
  color: #2c3e50;

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

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.25em;
  }

  p {
    margin-top: 0;
    margin-bottom: 16px;
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
    background-color: rgba(27, 31, 35, 0.05);
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

  img {
    max-width: 100%;
    height: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 16px;

    th, td {
      padding: 6px 13px;
      border: 1px solid #dfe2e5;
    }

    tr:nth-child(2n) {
      background-color: #f6f8fa;
    }
  }
}
</style>
