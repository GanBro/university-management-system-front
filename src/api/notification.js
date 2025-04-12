// src/api/notification.js
import request from '@/utils/request'

// 创建统一的API接口
const notificationAPI = {
  // 管理端API
  getList(params) {
    return request({
      url: '/notifications',
      method: 'get',
      params
    })
  },

  getDetail(id) {
    return request({
      url: `/notifications/${id}`,
      method: 'get'
    })
  },

  create(data) {
    return request({
      url: '/notifications',
      method: 'post',
      data
    })
  },

  update(id, data) {
    return request({
      url: `/notifications/${id}`,
      method: 'put',
      data
    })
  },

  delete(id) {
    return request({
      url: `/notifications/${id}`,
      method: 'delete'
    })
  },

  // 发布和归档功能
  publish(id) {
    return request({
      url: `/notifications/${id}/publish`,
      method: 'post'
    })
  },

  archive(id) {
    return request({
      url: `/notifications/${id}/archive`,
      method: 'post'
    })
  },

  // 从归档中恢复通知
  restore(id) {
    return request({
      url: `/notifications/${id}/restore`,
      method: 'post'
    })
  },

  // 用户端API
  getUserNotifications(userId) {
    return request({
      url: '/notifications/user/notifications',
      method: 'get',
      params: { userId }
    })
  },

  getUserNotificationsWithPage(params) {
    const userId = params.userId || null;
    return request({
      url: '/notifications/user/notifications',
      method: 'get',
      params: { ...params, userId, pageable: true }
    })
  },

  markAsRead(notificationId, userId) {
    return request({
      url: `/notifications/user/notifications/${notificationId}/read`,
      method: 'put',
      params: { userId }
    })
  },

  markAllAsRead(userId) {
    return request({
      url: '/notifications/user/notifications/read-all',
      method: 'put',
      params: { userId }
    })
  },

  getUnreadCount(userId) {
    return request({
      url: '/notifications/user/notifications/unread-count',
      method: 'get',
      params: { userId }
    })
  }
}

// 保持旧的导出方式以支持现有代码，同时支持新的API
export const getNotificationList = notificationAPI.getList
export const createNotification = notificationAPI.create
export const updateNotification = notificationAPI.update
export const deleteNotification = notificationAPI.delete
export const getNotificationDetail = notificationAPI.getDetail
export const getUserNotifications = notificationAPI.getUserNotifications
export const markNotificationAsRead = notificationAPI.markAsRead
export const markAllNotificationsAsRead = notificationAPI.markAllAsRead
export const getUnreadCount = notificationAPI.getUnreadCount
export const publishNotification = notificationAPI.publish
export const archiveNotification = notificationAPI.archive
export const restoreNotification = notificationAPI.restore

// 导出整个API对象
export default notificationAPI
