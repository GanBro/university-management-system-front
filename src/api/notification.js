// notification.js
import request from '@/utils/request'

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
