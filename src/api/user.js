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

// 获取用户列表
export function getUserList(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

// 获取用户详情
export function getUserDetail(userId) {
  return request({
    url: `/users/${userId}`,
    method: 'get'
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUser(id, data) {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

export function deleteUser(userId) {
  // 添加参数验证
  if (!userId) {
    return Promise.reject(new Error('用户ID不能为空'))
  }
  return request({
    url: `/users/${userId}`,
    method: 'delete'
  })
}

// 批量删除用户
export function batchDeleteUsers(userIds) {
  return request({
    url: '/users/batch',
    method: 'delete',
    data: userIds
  })
}

// 获取所有角色
export function getRoleList() {
  return request({
    url: '/roles',
    method: 'get'
  })
}

// 更新用户个人信息
export function updateProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

export function updatePassword(data) {
  return request({
    url: '/users/updatePassword',
    method: 'put',
    data
  })
}
