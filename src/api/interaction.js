// src/api/interaction.js
import request from '@/utils/request'

// 获取互动列表
export function getInteractionList(params) {
  return request({
    url: '/api/interactions',
    method: 'get',
    params
  })
}

// 获取互动详情
export function getInteractionDetail(id) {
  return request({
    url: `/api/interactions/${id}`,
    method: 'get'
  })
}

// 创建互动
export function createInteraction(data) {
  return request({
    url: '/api/interactions',
    method: 'post',
    data
  })
}

// 回复互动
export function replyInteraction(id, data) {
  return request({
    url: `/api/interactions/${id}/reply`,
    method: 'post',
    data
  })
}

// 关闭互动
export function closeInteraction(id) {
  return request({
    url: `/api/interactions/${id}/close`,
    method: 'post'
  })
}

// 重新开启互动
export function reopenInteraction(id) {
  return request({
    url: `/api/interactions/${id}/reopen`,
    method: 'post'
  })
}

// 删除互动
export function deleteInteraction(id) {
  return request({
    url: `/api/interactions/${id}`,
    method: 'delete'
  })
}

// 删除回复
export function deleteReply(id) {
  return request({
    url: `/api/interactions/replies/${id}`,
    method: 'delete'
  })
}

// 获取统计数据
export function getInteractionStats(params) {
  return request({
    url: '/api/interactions/stats',
    method: 'get',
    params
  })
}
