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
  // eslint-disable-next-line no-unused-vars
  const { captcha, confirmPassword, ...userData } = data

  // 使用userData而不是data发送请求
  return request({
    url: 'register',
    method: 'post',
    data: userData
  })
}

// 验证验证码
export function verifyCaptcha(code) {
  return request({
    url: '/captcha/verify',
    method: 'post',
    params: { code }
  })
}

// 请求密码重置验证码
export function requestPasswordReset(data) {
  return request({
    url: '/request-password-reset',
    method: 'post',
    data
  })
}

// 验证重置码
export function verifyResetCode(data) {
  return request({
    url: '/verify-reset-code',
    method: 'post',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/reset-password',
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
    url: '/users/profile', // 使用已有的用户资料更新端点
    method: 'put',
    data: { ...data, userId: id } // 确保包含用户ID
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

export function followUniversity(userId, universityId) {
  return request({
    url: '/users/follow',
    method: 'post',
    data: { userId, universityId }
  })
}

export function unfollowUniversity(userId, universityId) {
  return request({
    url: '/users/unfollow',
    method: 'post',
    data: { userId, universityId }
  })
}

export function getFollowedUniversities(userId) {
  return request({
    url: `/users/${userId}/followed-universities`,
    method: 'get'
  })
}
