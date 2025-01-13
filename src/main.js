import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'v-charts/lib/style.css' // 引入图表样式
import waves from './directive/waves'

// 不需要单独导入 Empty 组件
// import { Empty } from 'element-ui'

// 引入 v-charts
import VCharts from 'v-charts'
import 'v-charts/lib/style.css'

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// 全局注册 Element UI
Vue.use(ElementUI)

// 移除手动注册 el-empty
// Vue.component('el-empty', Empty)

Vue.use(VCharts)
Vue.use(waves)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

