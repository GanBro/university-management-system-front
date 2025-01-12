// message.js
import request from '@/utils/request'

export function getMessageLogList(params) {
  return request({
    url: '/message-logs',
    method: 'get',
    params
  })
}

export function sendMessage(data) {
  return request({
    url: '/message-logs',
    method: 'post',
    data
  })
}
