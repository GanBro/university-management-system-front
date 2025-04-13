// src/api/universitySatisfaction.js
import request from '@/utils/request'

/**
 * 获取院校满意度列表
 * @param {Object} params 查询参数
 * @returns {Promise} Promise对象
 */
export function getUniversitySatisfactionList(params) {
  return request({
    url: '/university-satisfaction/list',
    method: 'get',
    params
  })
}

/**
 * 获取院校满意度详情
 * @param {Number} universityId 院校ID
 * @returns {Promise} Promise对象
 */
export function getUniversitySatisfactionDetail(universityId) {
  return request({
    url: `/university-satisfaction/${universityId}`,
    method: 'get'
  })
}

/**
 * 保存或更新院校满意度
 * @param {Object} data 满意度数据
 * @returns {Promise} Promise对象
 */
export function saveUniversitySatisfaction(data) {
  return request({
    url: '/university-satisfaction/save',
    method: 'post',
    data
  })
}
