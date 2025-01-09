import request from '@/utils/request'

// 获取高校列表
export function getUniversityList(params) {
  return request({
    url: '/universities',
    method: 'get',
    params
  })
}

// 获取高校详情
export function getUniversityDetail(id) {
  return request({
    url: `/universities/${id}`,
    method: 'get'
  })
}

// 创建高校
export function createUniversity(data) {
  return request({
    url: '/universities',
    method: 'post',
    data
  })
}

// 更新高校
export function updateUniversity(id, data) {
  return request({
    url: `/universities/${id}`,
    method: 'put',
    data
  })
}

// 删除高校
export function deleteUniversity(id) {
  return request({
    url: `/universities/${id}`,
    method: 'delete'
  })
}

// 批量删除高校
export function batchDeleteUniversities(ids) {
  return request({
    url: '/universities/batch',
    method: 'post',
    data: ids
  })
}

// 导出高校列表
export function exportUniversityList(params) {
  // 将数组参数转换为逗号分隔的字符串
  const exportParams = {
    ...params,
    fields: Array.isArray(params.fields) ? params.fields.join(',') : params.fields
  }

  return request({
    url: '/universities/export',
    method: 'get',
    params: exportParams,
    responseType: 'blob',
    timeout: 60000
  })
}

// 获取筛选选项
export function getUniversityOptions() {
  return request({
    url: '/universities/options',
    method: 'get'
  })
}
