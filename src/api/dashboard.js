// src/api/dashboard.js
import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期 (YYYY-MM)
 * @param {string} params.endDate - 结束日期 (YYYY-MM)
 * @returns {Promise}
 */
export function getStats(params) {
  return request({
    url: '/api/dashboard/stats',
    method: 'get',
    params
  })
}

/**
 * 获取高校数量增长趋势
 * @param {Object} params - 查询参数
 * @param {string} params.startDate - 开始日期 (YYYY-MM)
 * @param {string} params.endDate - 结束日期 (YYYY-MM)
 * @returns {Promise}
 */
export function getGrowthTrend(params) {
  return request({
    url: '/api/dashboard/growth-trend',
    method: 'get',
    params
  })
}

export default {
  getStats,
  getGrowthTrend
}
