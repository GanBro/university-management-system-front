// src/utils/request.js
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 创建axios对象
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      // 添加两种header格式的token，确保兼容性
      config.headers['X-Token'] = getToken()
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截
service.interceptors.response.use(
  response => {
    // 如果是文件下载，直接返回响应
    if (response.config.responseType === 'blob') {
      // 检查响应头的content-type，确保是文件类型
      const contentType = response.headers['content-type']
      if (response.status === 200 && contentType && contentType.includes('application')) {
        return response
      } else {
        // 如果响应的不是文件，尝试解析错误信息
        return response.data.text().then(text => {
          let errorMsg = '文件导出失败'
          try {
            const error = JSON.parse(text)
            errorMsg = error.message || errorMsg
          } catch (e) {
            // JSON解析失败时使用默认错误信息
          }
          Message({
            message: errorMsg,
            type: 'error',
            duration: 5 * 1000
          })
          return Promise.reject(new Error(errorMsg))
        })
      }
    }

    const res = response.data

    // 增加对res是否存在的检查
    if (!res) {
      const errorMsg = '响应数据格式错误'
      Message({
        message: errorMsg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(errorMsg))
    }

    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 处理token过期的情况
      if (res.code === 401 || res.code === 403) {
        // 可以在这里调用登出方法
        store.dispatch('user/logout').then(() => {
          location.reload()
        })
      }

      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // 处理网络错误、超时等情况
    let errorMsg = error.message || '请求失败'

    if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
      errorMsg = '请求超时'
    }

    // 处理文件下载失败的情况
    if (error.config && error.config.responseType === 'blob') {
      errorMsg = '文件导出失败：' + errorMsg
    }

    Message({
      message: errorMsg,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
