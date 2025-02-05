// store/modules/dashboard.js
import { getStats, getGrowthTrend } from '@/api/dashboard'

const getDefaultState = () => {
  return {
    stats: {
      // 基础统计数据
      totalUniversityCount: 0,         // 高校总数
      recentUniversityCount: 0,        // 最近新增高校数
      activeUserCount: 0,              // 活跃用户数
      monthlyActiveUserCount: 0,       // 月度活跃用户数

      // 咨询相关统计
      totalInteractionCount: 0,        // 咨询总数
      pendingInteractionCount: 0,      // 待处理咨询数
      avgResponseTime: 0,              // 平均响应时间
      responseRate: 0,                 // 响应率

      // 地理分布数据
      universityDistribution: [],      // 高校地理分布

      // 增长趋势数据
      growthTrend: [],                // 高校增长趋势

      // 活跃度统计
      dailyActiveUsers: [],           // 日活跃用户
      weeklyActiveUsers: [],          // 周活跃用户
      monthlyActiveUsers: [],         // 月活跃用户

      // 用户行为统计
      userBehaviorStats: {
        consultationCount: 0,         // 咨询数（与totalInteractionCount一致）
        replyCount: 0,               // 回复数
        followCount: 0               // 关注数
      }
    },

    // 活跃用户排行
    activeUserRanking: [],

    // 系统状态
    systemStatus: {
      lastUpdateTime: null,
      dataFreshness: null
    }
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },

  SET_STATS: (state, stats) => {
    state.stats = {
      ...state.stats,
      ...stats
    }
  },

  SET_ACTIVE_USER_RANKING: (state, ranking) => {
    state.activeUserRanking = ranking
  },

  SET_SYSTEM_STATUS: (state, status) => {
    state.systemStatus = status
  },

  UPDATE_GROWTH_TREND: (state, trend) => {
    state.stats.growthTrend = trend
  },

  UPDATE_USER_BEHAVIOR: (state, behavior) => {
    state.stats.userBehaviorStats = {
      ...state.stats.userBehaviorStats,
      ...behavior
    }
  }
}

const actions = {
  // 重置状态
  resetStats({ commit }) {
    return new Promise(resolve => {
      commit('RESET_STATE')
      resolve()
    })
  },

  // 获取仪表盘所有数据
  async fetchDashboardData({ dispatch }) {
    try {
      const results = await Promise.all([
        dispatch('fetchStats'),
        dispatch('fetchGrowthTrend')
      ])
      return results
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      return []
    }
  },

  // 获取统计数据
  async fetchStats({ commit }) {
    try {
      const response = await getStats()
      const statsData = response.data

      // 处理统计数据
      const formattedStats = {
        totalUniversityCount: statsData.totalUniversityCount || 0,
        recentUniversityCount: statsData.recentUniversityCount || 0,
        activeUserCount: statsData.activeUserCount || 0,
        monthlyActiveUserCount: statsData.monthlyActiveUserCount || 0,
        totalInteractionCount: statsData.totalInteractionCount || 0,
        pendingInteractionCount: statsData.pendingInteractionCount || 0,
        avgResponseTime: statsData.avgResponseTime || 0,
        responseRate: statsData.responseRate || 0,
        universityDistribution: statsData.universityDistribution || []
      }

      commit('SET_STATS', formattedStats)

      // 更新用户行为统计，确保咨询数与总咨询数保持一致
      if (statsData.userBehaviorStats) {
        const behaviorStats = {
          ...statsData.userBehaviorStats,
          consultationCount: statsData.totalInteractionCount || 0
        }
        commit('UPDATE_USER_BEHAVIOR', behaviorStats)
      }

      // 更新活跃用户排行
      if (statsData.activeUserRanking) {
        commit('SET_ACTIVE_USER_RANKING', statsData.activeUserRanking)
      }

      // 更新系统状态
      commit('SET_SYSTEM_STATUS', {
        lastUpdateTime: new Date().toISOString(),
        dataFreshness: 'realtime'
      })

      return formattedStats
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      throw error
    }
  },

  // 获取增长趋势数据
  async fetchGrowthTrend({ commit }) {
    try {
      const response = await getGrowthTrend()
      commit('UPDATE_GROWTH_TREND', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch growth trend:', error)
      throw error
    }
  },

  // 按时间范围获取数据
  async fetchDataByTimeRange({ dispatch }, timeRange) {
    try {
      const results = await Promise.all([
        dispatch('fetchStats', { timeRange }),
        dispatch('fetchGrowthTrend', { timeRange })
      ])
      return results
    } catch (error) {
      console.error('Failed to fetch data by time range:', error)
      throw error
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
