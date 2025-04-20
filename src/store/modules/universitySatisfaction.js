// src/store/modules/universitySatisfaction.js
import {
  getUniversitySatisfactionList,
  getUniversitySatisfactionDetail,
  saveUniversitySatisfaction
} from '@/api/universitySatisfaction'

const state = {
  list: [],
  total: 0,
  currentSatisfaction: null,
  listLoading: false,
  detailLoading: false,
  satisfactionStats: {
    overallSatisfaction: 0,
    satisfactionTrend: 0,
    totalRatings: 0,
    monthlyNewRatings: 0,
    participationRate: 0,
    participationTrend: 0
  },
  ratingDistribution: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  }
}

const mutations = {
  SET_LIST: (state, { list, total }) => {
    state.list = list
    state.total = total
  },
  SET_CURRENT_SATISFACTION: (state, satisfaction) => {
    state.currentSatisfaction = satisfaction
  },
  SET_LIST_LOADING: (state, loading) => {
    state.listLoading = loading
  },
  SET_DETAIL_LOADING: (state, loading) => {
    state.detailLoading = loading
  },
  SET_SATISFACTION_STATS: (state, stats) => {
    state.satisfactionStats = stats
  },
  SET_RATING_DISTRIBUTION: (state, distribution) => {
    state.ratingDistribution = distribution
  }
}

const actions = {
  // 获取满意度列表
  async getList({ commit }, query) {
    commit('SET_LIST_LOADING', true)
    try {
      const { data } = await getUniversitySatisfactionList(query)
      if (data) {
        commit('SET_LIST', {
          list: data.records || [],
          total: data.total || 0
        })
        return data
      }
      return { records: [], total: 0 }
    } catch (error) {
      console.error('获取满意度列表失败:', error)
      throw error
    } finally {
      commit('SET_LIST_LOADING', false)
    }
  },

  // 获取满意度详情
  async getDetail({ commit }, universityId) {
    commit('SET_DETAIL_LOADING', true)
    try {
      const { data } = await getUniversitySatisfactionDetail(universityId)
      commit('SET_CURRENT_SATISFACTION', data)

      // 处理并更新统计数据
      if (data) {
        // 构建简单统计
        const statsData = {
          overallSatisfaction: data.overallRating || 0,
          totalRatings: data.overallCount || 0,
          // 其他字段可基于具体需求添加
          satisfactionTrend: 2.3, // 默认值或计算
          monthlyNewRatings: Math.floor(data.overallCount * 0.1) || 0, // 简单估算
          participationRate: 85, // 默认值
          participationTrend: 5 // 默认值
        }
        commit('SET_SATISFACTION_STATS', statsData)

        // 模拟评分分布
        if (data.overallCount > 0) {
          // 模拟评分分布 - 实际应从后端获取
          const distribution = {
            5: 45,
            4: 35,
            3: 15,
            2: 4,
            1: 1
          }
          commit('SET_RATING_DISTRIBUTION', distribution)
        }
      }

      return data
    } catch (error) {
      console.error('获取满意度详情失败:', error)
      throw error
    } finally {
      commit('SET_DETAIL_LOADING', false)
    }
  },

  // 保存或更新满意度
  async saveSatisfaction({ dispatch }, data) {
    try {
      const response = await saveUniversitySatisfaction(data)
      // 成功后刷新列表
      await dispatch('getList', {})
      return response
    } catch (error) {
      console.error('保存满意度失败:', error)
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
