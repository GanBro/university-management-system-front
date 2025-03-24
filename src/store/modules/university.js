import {
  getUniversityList,
  getUniversityDetail,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  exportUniversityList,
  exportFollowedUniversities,
  batchDeleteUniversities,
  getUniversitySatisfaction,
  getMajorSatisfaction,
  getMajorRecommendations,
  getConsultations,
  submitConsultation,
  updateUniversityLogo
} from '@/api/university'

const state = {
  // 列表相关状态
  list: {
    records: [],
    total: 0,
    size: 10,
    current: 1
  },
  currentUniversity: null,
  listLoading: false,
  detailLoading: false,

  // 满意度和推荐相关状态
  satisfactionData: {
    overall: 0,
    environment: 0,
    life: 0
  },
  majorSatisfaction: [], // 专业满意度列表
  recommendations: {
    counts: [], // 推荐人数列表
    index: [] // 推荐指数列表
  },
  consultations: [] // 咨询列表
}

const mutations = {
  SET_LIST: (state, data) => {
    state.list = {
      records: data.records || [],
      total: data.total || 0,
      size: data.size || 10,
      current: data.current || 1
    }
  },
  SET_CURRENT_UNIVERSITY: (state, university) => {
    state.currentUniversity = university
  },
  SET_LIST_LOADING: (state, loading) => {
    state.listLoading = loading
  },
  SET_DETAIL_LOADING: (state, loading) => {
    state.detailLoading = loading
  },
  SET_SATISFACTION_DATA: (state, data) => {
    state.satisfactionData = data
  },
  SET_MAJOR_SATISFACTION: (state, data) => {
    state.majorSatisfaction = data
  },
  SET_RECOMMENDATIONS: (state, data) => {
    state.recommendations = data
  },
  SET_CONSULTATIONS: (state, data) => {
    state.consultations = data
  }
}

const actions = {
  // 获取高校列表
  getList({ commit }, query) {
    commit('SET_LIST_LOADING', true)
    return new Promise((resolve, reject) => {
      getUniversityList(query)
        .then(response => {
          const { data } = response
          commit('SET_LIST', data)
          resolve(data)
        })
        .catch(error => {
          console.error('获取高校列表失败:', error)
          reject(error)
        })
        .finally(() => {
          commit('SET_LIST_LOADING', false)
        })
    })
  },

  // 获取高校详情
  async getDetail({ commit, dispatch }, id) {
    try {
      commit('SET_DETAIL_LOADING', true)
      const { data } = await getUniversityDetail(id)
      commit('SET_CURRENT_UNIVERSITY', data)

      // 获取满意度等相关数据
      await Promise.all([
        dispatch('getSatisfactionData', id),
        dispatch('getMajorSatisfaction', id),
        dispatch('getRecommendations', id),
        dispatch('getConsultations', id)
      ])

      return data
    } catch (error) {
      console.error('获取高校详情失败:', error)
      throw error
    } finally {
      commit('SET_DETAIL_LOADING', false)
    }
  },

  // 创建高校
  createUniversity({ dispatch }, universityData) {
    return new Promise((resolve, reject) => {
      createUniversity(universityData)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          console.error('创建高校失败:', error)
          reject(error)
        })
    })
  },

  // 更新高校
  updateUniversity({ dispatch }, { id, data }) {
    return new Promise((resolve, reject) => {
      updateUniversity(id, data)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          console.error('更新高校失败:', error)
          reject(error)
        })
    })
  },

  // 更新高校logo
  updateLogo({ dispatch }, { id, logo }) {
    return new Promise((resolve, reject) => {
      updateUniversityLogo(id, logo)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          console.error('更新学校logo失败:', error)
          reject(error)
        })
    })
  },

  // 删除高校
  deleteUniversity({ dispatch }, id) {
    return new Promise((resolve, reject) => {
      deleteUniversity(id)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          console.error('删除高校失败:', error)
          reject(error)
        })
    })
  },

  // 批量删除高校
  batchDeleteUniversities({ dispatch }, ids) {
    return new Promise((resolve, reject) => {
      batchDeleteUniversities(ids)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          console.error('批量删除失败:', error)
          reject(error)
        })
    })
  },

  // 导出高校列表
  exportList({ commit }, query) {
    return new Promise((resolve, reject) => {
      // 确定使用哪个导出API
      let exportPromise;

      if (query.followedOnly && query.userId) {
        // 用户关注的高校导出
        exportPromise = exportFollowedUniversities(query.userId, {
          fields: query.fields
        });
      } else {
        // 普通高校列表导出
        exportPromise = exportUniversityList(query);
      }

      exportPromise
        .then(response => {
          // 创建 blob 并下载
          const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          const filename = response.headers['content-disposition']?.split('filename=')[1] || '高校列表.xlsx'
          link.setAttribute('download', decodeURIComponent(filename))
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          resolve(response)
        })
        .catch(error => {
          console.error('导出失败:', error)
          reject(error)
        })
    })
  },

  // 获取满意度数据
  async getSatisfactionData({ commit }, id) {
    try {
      const { data } = await getUniversitySatisfaction(id)
      commit('SET_SATISFACTION_DATA', data)
      return data
    } catch (error) {
      console.error('获取满意度数据失败:', error)
      throw error
    }
  },

  // 获取专业满意度
  async getMajorSatisfaction({ commit }, id) {
    try {
      const { data } = await getMajorSatisfaction(id)
      commit('SET_MAJOR_SATISFACTION', data)
      return data
    } catch (error) {
      console.error('获取专业满意度失败:', error)
      throw error
    }
  },

  // 获取专业推荐数据
  async getRecommendations({ commit }, id) {
    try {
      const { data } = await getMajorRecommendations(id)
      commit('SET_RECOMMENDATIONS', data)
      return data
    } catch (error) {
      console.error('获取专业推荐失败:', error)
      throw error
    }
  },

  // 获取咨询列表
  async getConsultations({ commit }, id) {
    try {
      const { data } = await getConsultations(id)
      commit('SET_CONSULTATIONS', data)
      return data
    } catch (error) {
      console.error('获取咨询列表失败:', error)
      throw error
    }
  },

  // 提交咨询
  async submitConsultation({ dispatch }, { id, consultationData }) {
    try {
      const response = await submitConsultation(id, consultationData)
      await dispatch('getConsultations', id)
      return response // 添加返回值以便组件处理结果
    } catch (error) {
      console.error('提交咨询失败:', error)
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
