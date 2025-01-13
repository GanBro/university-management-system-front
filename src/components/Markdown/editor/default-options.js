// src/components/Markdown/editor/default-options.js
export default {
  minHeight: '200px',
  initialEditType: 'wysiwyg',  // Force WYSIWYG mode
  previewStyle: 'tab',
  useCommandShortcut: true,
  useDefaultHTMLSanitizer: true,
  usageStatistics: false,
  hideModeSwitch: true,  // Hide the mode switch button
  toolbarItems: [
    'heading',
    'bold',
    'italic',
    'strike',
    'divider',
    'hr',
    'quote',
    'divider',
    'ul',
    'ol',
    'task',
    'indent',
    'outdent',
    'divider',
    'table',
    'image',
    'link',
    'divider',
    'code'
  ]
}
