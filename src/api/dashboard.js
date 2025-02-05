// src/api/dashboard.js
import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 * @returns {Promise}
 */
export function getStats() {
  return request({
    url: '/api/dashboard/stats',
    method: 'get'
  })
}

/**
 * 获取高校数量增长趋势
 * @returns {Promise}
 */
export function getGrowthTrend() {
  return request({
    url: '/api/dashboard/growth-trend',
    method: 'get'
  })
}

export default {
  getStats,
  getGrowthTrend
}
