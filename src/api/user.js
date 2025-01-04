// src/api/user.js
import request from '@/utils/request'

export function login(data) {
  console.log('发送登录请求:', data)
  return request({
    url: 'login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  console.log('请求用户信息, token:', token)
  return request({
    url: 'getUserByToken',
    method: 'get',
    params: { token }
  })
}

export function register(data) {
  return request({
    url: 'register',
    method: 'post',
    data
  })
}

