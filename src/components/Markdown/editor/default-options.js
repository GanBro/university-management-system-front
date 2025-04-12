// src/components/Markdown/editor/default-options.js
/**
 * Markdown编辑器默认配置
 * 精简配置项以提高性能
 */
export default {
  minHeight: '200px',
  initialEditType: 'markdown',  // 使用markdown模式而不是wysiwyg，降低初始化负担
  previewStyle: 'tab',  // 使用tab方式预览，减少初始加载的DOM元素
  useCommandShortcut: true,
  useDefaultHTMLSanitizer: true,
  usageStatistics: false,  // 关闭使用统计
  hideModeSwitch: true,  // 隐藏模式切换按钮
  toolbarItems: [
    ['heading', 'bold', 'italic'],  // 将工具栏按钮进行分组，减少渲染负担
    ['hr', 'quote'],
    ['ul', 'ol', 'task', 'indent', 'outdent'],
    ['table', 'image', 'link'],
    ['code']
  ],
  // 延迟加载相关配置
  events: {
    load: function(editor) {
      // 编辑器加载完成后的回调
      console.log('Editor loaded successfully');
    }
  },
  // 优化图片上传配置
  customHTMLSanitizer: function(html) {
    // 自定义HTML清理函数，提高性能
    return html;
  }
}
