// src/api/university.js
import request from '@/utils/request'

export function getUniversityList(params) {
  return request({
    url: '/universities',
    method: 'get',
    params
  })
}

export function getUniversityDetail(id) {
  return request({
    url: `/universities/${id}`,
    method: 'get'
  })
}

export function createUniversity(data) {
  return request({
    url: '/universities',
    method: 'post',
    data
  })
}

export function updateUniversity(id, data) {
  return request({
    url: `/universities/${id}`,
    method: 'put',
    data
  })
}

export function deleteUniversity(id) {
  return request({
    url: `/universities/${id}`,
    method: 'delete'
  })
}
