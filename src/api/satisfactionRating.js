// src/api/satisfactionRating.js
import request from '@/utils/request'

/**
 * 获取专业满意度列表
 * @param {Object} params 查询参数 - 包含: page, limit, universityId, category, minRating, maxRating
 * @returns {Promise} Promise对象
 */
export function getSatisfactionRatingList(params) {
  return request({
    url: '/university-satisfaction/list',
    method: 'get',
    params: {
      ...params,
      type: 'major' // 添加类型参数，表明是查询专业满意度
    }
  })
}

/**
 * 获取专业满意度详情
 * @param {Number} id 满意度记录ID
 * @returns {Promise} Promise对象
 */
export function getSatisfactionRatingDetail(id) {
  return request({
    url: `/university-satisfaction/${id}`,
    method: 'get',
    params: {
      type: 'major'
    }
  })
}

/**
 * 保存或更新专业满意度
 * @param {Object} data 满意度数据
 * @returns {Promise} Promise对象
 */
export function saveSatisfactionRating(data) {
  return request({
    url: '/university-satisfaction/save',
    method: 'post',
    data: {
      ...data,
      type: 'major' // 添加类型参数，表明是保存专业满意度
    }
  })
}

/**
 * 删除专业满意度记录
 * @param {Number} id 记录ID
 * @returns {Promise} Promise对象
 */
export function deleteSatisfactionRating(id) {
  return request({
    url: `/university-satisfaction/${id}`,
    method: 'delete',
    params: {
      type: 'major'
    }
  })
}
