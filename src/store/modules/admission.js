// src/store/modules/admission.js
import {
  getAdmissionList,
  createAdmission,
  updateAdmission,
  deleteAdmission
} from '@/api/admission'

const state = {
  list: [], // 分数线列表
  total: 0,
  loading: false
}

const mutations = {
  SET_LIST: (state, list) => {
    state.list = list
  },
  SET_TOTAL: (state, total) => {
    state.total = total
  },
  SET_LOADING: (state, loading) => {
    state.loading = loading
  }
}

const actions = {
  // 获取招生数据列表
  async getList({ commit }, { universityId, query }) {
    commit('SET_LOADING', true)
    try {
      const { data } = await getAdmissionList(universityId, query)

      // 处理筛选
      let filteredData = data
      if (query.province || query.year) {
        filteredData = data.filter(item => {
          let match = true
          if (query.province && item.province !== query.province) {
            match = false
          }
          if (query.year && item.year.toString() !== query.year.toString()) {
            match = false
          }
          return match
        })
      }

      commit('SET_LIST', filteredData)
      commit('SET_TOTAL', filteredData.length)
      return filteredData
    } catch (error) {
      console.error('获取招生数据列表失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // 创建招生数据
  async create({ dispatch }, data) {
    try {
      await createAdmission(data)
      return true
    } catch (error) {
      console.error('创建招生数据失败:', error)
      throw error
    }
  },

  // 更新招生数据
  async update({ dispatch }, { id, data }) {
    try {
      await updateAdmission(id, data)
      return true
    } catch (error) {
      console.error('更新招生数据失败:', error)
      throw error
    }
  },

  // 删除招生数据
  async delete({ dispatch }, id) {
    try {
      await deleteAdmission(id)
      return true
    } catch (error) {
      console.error('删除招生数据失败:', error)
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
