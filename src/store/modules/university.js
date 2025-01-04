// src/store/modules/university.js
import { getUniversityList, getUniversityDetail, createUniversity, updateUniversity, deleteUniversity, exportUniversityList } from '@/api/university'

const state = {
  list: [],
  total: 0,
  currentUniversity: null,
  listLoading: false,
  detailLoading: false
}

const mutations = {
  SET_LIST: (state, { list, total }) => {
    state.list = list
    state.total = total
  },
  SET_CURRENT_UNIVERSITY: (state, university) => {
    state.currentUniversity = university
  },
  SET_LIST_LOADING: (state, loading) => {
    state.listLoading = loading
  },
  SET_DETAIL_LOADING: (state, loading) => {
    state.detailLoading = loading
  }
}

const actions = {
  // 获取高校列表
  async getList({ commit }, query) {
    commit('SET_LIST_LOADING', true)
    try {
      const { data } = await getUniversityList(query)
      commit('SET_LIST', {
        list: data.records,
        total: data.total
      })
    } finally {
      commit('SET_LIST_LOADING', false)
    }
  },

  // 获取高校详情
  async getDetail({ commit }, id) {
    commit('SET_DETAIL_LOADING', true)
    try {
      const { data } = await getUniversityDetail(id)
      commit('SET_CURRENT_UNIVERSITY', data)
      return data
    } finally {
      commit('SET_DETAIL_LOADING', false)
    }
  },

  // 创建高校
  async createUniversity({ dispatch }, universityData) {
    await createUniversity(universityData)
    return dispatch('getList')
  },

  // 更新高校
  async updateUniversity({ dispatch }, { id, data }) {
    await updateUniversity(id, data)
    return dispatch('getList')
  },

  // 删除高校
  async deleteUniversity({ dispatch }, id) {
    await deleteUniversity(id)
    return dispatch('getList')
  },

  // 导出高校列表
  async exportList({ commit }, query) {
    try {
      const response = await exportUniversityList(query)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = response.headers['content-disposition']?.split('filename=')[1] || '高校列表.xlsx'
      link.setAttribute('download', decodeURIComponent(filename))
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      return true
    } catch (error) {
      console.error('导出失败:', error)
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
