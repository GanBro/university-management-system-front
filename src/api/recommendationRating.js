// src/api/recommendationRating.js
import request from '@/utils/request'

/**
 * 获取专业推荐列表
 * @param {Object} params 查询参数 - 包含: page, limit, universityId, majorCategory, minRating, maxRating
 * @returns {Promise} Promise对象
 */
export function getRecommendationRatingList(params) {
  return request({
    url: '/recommendation-rating/list',
    method: 'get',
    params
  })
}

/**
 * 获取专业推荐详情
 * @param {Number} id 推荐记录ID
 * @returns {Promise} Promise对象
 */
export function getRecommendationRatingDetail(id) {
  return request({
    url: `/recommendation-rating/${id}`,
    method: 'get'
  })
}

/**
 * 保存或更新专业推荐
 * @param {Object} data 推荐数据
 * @returns {Promise} Promise对象
 */
export function saveRecommendationRating(data) {
  return request({
    url: '/recommendation-rating/save',
    method: 'post',
    data
  })
}

/**
 * 删除专业推荐记录
 * @param {Number} id 记录ID
 * @returns {Promise} Promise对象
 */
export function deleteRecommendationRating(id) {
  return request({
    url: `/recommendation-rating/${id}`,
    method: 'delete'
  })
}

/**
 * 获取大学专业推荐列表
 * @param {Number} universityId 大学ID
 * @returns {Promise} Promise对象
 */
export function getUniversityRecommendations(universityId) {
  return request({
    url: `/recommendation-rating/university/${universityId}`,
    method: 'get'
  })
}

/**
 * 更新大学专业推荐
 * @param {Number} universityId 大学ID
 * @param {Object} data 推荐数据
 * @returns {Promise} Promise对象
 */
export function updateUniversityRecommendation(universityId, data) {
  return request({
    url: `/recommendation-rating/university/${universityId}/update-recommendation`,
    method: 'post',
    data
  })
}
