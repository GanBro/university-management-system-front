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
      config.headers['X-Token'] = getToken()
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
      // 检查响应状态码
      if (response.status === 200) {
        return response
      } else {
        Message({
          message: '文件导出失败',
          type: 'error',
          duration: 5 * 1000
        })
        return Promise.reject(new Error('文件导出失败'))
      }
    }

    const res = response.data

    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    // 处理文件下载失败的情况
    if (error.config && error.config.responseType === 'blob') {
      // 如果是文件下载请求失败
      Message({
        message: '文件导出失败：' + error.message,
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      // 其他请求失败的情况
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default service
