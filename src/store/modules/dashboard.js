// src/store/modules/dashboard.js
import { getStats, getGrowthTrend } from '@/api/dashboard'

const getDefaultState = () => {
  return {
    stats: {
      totalUniversityCount: 0, // 高校总数量
      recentUniversityCount: 0, // 最近新增高校数量
      activeUserCount: 0, // 活跃用户数量（过去7天）
      monthlyActiveUserCount: 0, // 月活跃用户数量（过去30天）
      universityDistribution: [], // 高校分布数据
      growthTrend: [] // 高校增长趋势数据
    }
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_STATS: (state, stats) => {
    state.stats = stats
  }
}

const actions = {
  // 获取仪表盘数据，包括统计数据和增长趋势
  fetchStats({ commit }) {
    return new Promise((resolve, reject) => {
      // 同时请求统计数据和增长趋势数据
      Promise.all([getStats(), getGrowthTrend()])
        .then(([statsResponse, growthTrendResponse]) => {
          console.log('getStats Response:', statsResponse)
          console.log('getGrowthTrend Response:', growthTrendResponse)

          const statsData = statsResponse.data
          const growthTrendData = growthTrendResponse.data

          const formattedStats = {
            totalUniversityCount: statsData.totalUniversityCount || 0,
            recentUniversityCount: statsData.recentUniversityCount || 0,
            activeUserCount: statsData.activeUserCount || 0,
            monthlyActiveUserCount: statsData.monthlyActiveUserCount || 0,
            universityDistribution: statsData.universityDistribution || [],
            growthTrend: growthTrendData || []
          }

          console.log('Formatted Stats:', formattedStats)

          commit('SET_STATS', formattedStats)
          resolve(formattedStats)
        })
        .catch(error => {
          console.error('Error fetching stats and growthTrend:', error)
          reject(error)
        })
    })
  },

  // 重置仪表盘数据
  resetStats({ commit }) {
    return new Promise(resolve => {
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
