// store/modules/dashboard.js
import { getStats, getGrowthTrend, getActivityStats } from '@/api/dashboard'

const getDefaultState = () => {
  return {
    stats: {
      // 基础统计数据
      totalUniversityCount: 0,
      recentUniversityCount: 0,
      activeUserCount: 0,
      monthlyActiveUserCount: 0,
      // 新增：互动统计
      totalInteractionCount: 0,
      pendingInteractionCount: 0,
      avgResponseTime: 0,
      responseRate: 0,
      // 地理分布数据
      universityDistribution: [],
      // 增长趋势数据
      growthTrend: [],
      // 新增：活跃度统计
      dailyActiveUsers: [],
      weeklyActiveUsers: [],
      monthlyActiveUsers: [],
      // 新增：用户行为分析
      userBehaviorStats: {
        consultationCount: 0,
        replyCount: 0,
        followCount: 0
      }
    },
    // 新增：活跃用户排行
    activeUserRanking: [],
    // 新增：系统状态
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
      await Promise.all([
        dispatch('fetchStats'),
        dispatch('fetchGrowthTrend'),
        dispatch('fetchActivityStats')
      ])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      throw error
    }
  },

  // 获取基础统计数据
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

  // 获取活跃度统计数据
  async fetchActivityStats({ commit }) {
    try {
      const response = await getActivityStats()
      const activityData = response.data

      // 更新用户行为统计
      if (activityData.behaviorStats) {
        commit('UPDATE_USER_BEHAVIOR', activityData.behaviorStats)
      }

      // 更新活跃用户排行
      if (activityData.userRanking) {
        commit('SET_ACTIVE_USER_RANKING', activityData.userRanking)
      }

      return activityData
    } catch (error) {
      console.error('Failed to fetch activity stats:', error)
      throw error
    }
  },

  // 按时间范围获取数据
  async fetchDataByTimeRange({ dispatch }, timeRange) {
    try {
      const requests = [
        dispatch('fetchStats', { timeRange }),
        dispatch('fetchGrowthTrend', { timeRange }),
        dispatch('fetchActivityStats', { timeRange })
      ]
      const results = await Promise.all(requests)
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
