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
    method: 'get',
    timeout: 15000
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
    fields: Array.isArray(params.fields) ? params.fields.join(',') : params.fields,
    ids: Array.isArray(params.ids) ? params.ids.join(',') : params.ids
  }

  return request({
    url: '/universities/export',
    method: 'get',
    params: exportParams,
    responseType: 'blob',
    timeout: 60000
  })
}

// 导出关注的高校
export function exportFollowedUniversities(userId, params) {
  // 将数组参数转换为逗号分隔的字符串
  const exportParams = {
    ...params,
    fields: Array.isArray(params.fields) ? params.fields.join(',') : params.fields,
    userId
  }

  return request({
    url: '/universities/export/followed',
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

export function updateUniversityLogo(id, logo) {
  return request({
    url: `/universities/${id}/logo`,
    method: 'put',
    data: { logo }
  })
}

// 获取院校满意度
export function getUniversitySatisfaction(id) {
  return request({
    url: `/universities/${id}/satisfaction`,
    method: 'get'
  })
}

// 获取专业满意度
export function getMajorSatisfaction(id) {
  return request({
    url: `/universities/${id}/major-satisfaction`,
    method: 'get'
  })
}

// 获取专业推荐
export function getMajorRecommendations(id) {
  return request({
    url: `/universities/${id}/recommendations`,
    method: 'get'
  })
}

// 获取咨询列表
export function getConsultations(id) {
  return request({
    url: `/universities/${id}/consultations`,
    method: 'get'
  })
}

// 提交咨询
export function submitConsultation(universityId, data) {
  return request({
    url: `/universities/${universityId}/consultations`,
    method: 'post',
    data: {
      ...data,
      universityId: universityId // 确保包含大学ID
    }
  })
}

// university.js 中添加以下方法
export function searchUniversities(keyword, limit) {
  return request({
    url: '/universities/search',
    method: 'get',
    params: { keyword, limit }
  })
}

// 获取招生数据
export function getAdmissionData(id) {
  return request({
    url: `/universities/${id}/admission-data`,
    method: 'get'
  })
}

/**
 * 更新专业满意度
 * @param {Object} data 更新的满意度数据
 * @returns {Promise} Promise对象
 */
export function updateSatisfactionRating(data) {
  return request({
    url: `/universities/${data.universityId}/update-satisfaction`,
    method: 'post',
    data
  })
}

/**
 * 删除专业满意度
 * @param {Number} id 记录ID
 * @returns {Promise} Promise对象
 */
export function deleteSatisfactionRating(id) {
  return request({
    url: `/universities/satisfaction/${id}`,
    method: 'delete'
  })
}

/**
 * 更新专业推荐
 * @param {Object} data 更新的推荐数据
 * @returns {Promise} Promise对象
 */
export function updateRecommendationRating(data) {
  return request({
    url: `/universities/${data.universityId}/update-recommendation`,
    method: 'post',
    data
  })
}

/**
 * 删除专业推荐
 * @param {Number} id 记录ID
 * @returns {Promise} Promise对象
 */
export function deleteRecommendationRating(id) {
  return request({
    url: `/universities/recommendation/${id}`,
    method: 'delete'
  })
}
