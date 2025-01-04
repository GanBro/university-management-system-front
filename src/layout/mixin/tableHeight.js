// src/mixins/tableHeight.js
export default {
  data() {
    return {
      tableHeight: 500
    }
  },
  mounted() {
    this.calcTableHeight()
    window.addEventListener('resize', this.calcTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcTableHeight)
  },
  methods: {
    calcTableHeight() {
      this.tableHeight = window.innerHeight - 320 // 调整此值以适应你的布局
    }
  }
}
