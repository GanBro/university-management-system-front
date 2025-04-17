// src/api/admission.js
import request from '@/utils/request'

// 获取招生数据列表
export function getAdmissionList(universityId, params) {
  return request({
    url: `/universities/${universityId}/admission-data`,
    method: 'get',
    params
  })
}

// 创建招生数据
export function createAdmission(data) {
  return request({
    url: '/admissions',
    method: 'post',
    data
  })
}

// 更新招生数据
export function updateAdmission(id, data) {
  return request({
    url: `/admissions/${id}`,
    method: 'put',
    data
  })
}

// 删除招生数据
export function deleteAdmission(id) {
  return request({
    url: `/admissions/${id}`,
    method: 'delete'
  })
}
