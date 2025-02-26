// notification.js
import request from '@/utils/request'

// 管理端API
export function getNotificationList(params) {
  return request({
    url: '/notifications',
    method: 'get',
    params
  })
}

export function createNotification(data) {
  return request({
    url: '/notifications',
    method: 'post',
    data
  })
}

export function updateNotification(id, data) {
  return request({
    url: `/notifications/${id}`,
    method: 'put',
    data
  })
}

export function deleteNotification(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'delete'
  })
}

export function getNotificationDetail(id) {
  return request({
    url: `/notifications/${id}`,
    method: 'get'
  })
}

// 用户端API
export function getUserNotifications(userId) {
  return request({
    url: '/notifications/user/notifications',
    method: 'get',
    params: { userId }
  })
}

export function markNotificationAsRead(notificationId, userId) {
  return request({
    url: `/notifications/user/notifications/${notificationId}/read`,
    method: 'put',
    params: { userId }
  })
}

export function markAllNotificationsAsRead(userId) {
  return request({
    url: '/notifications/user/notifications/read-all',
    method: 'put',
    params: { userId }
  })
}

export function getUnreadCount(userId) {
  return request({
    url: '/notifications/user/notifications/unread-count',
    method: 'get',
    params: { userId }
  })
}
