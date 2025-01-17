// src/store/modules/interaction.js
import {
  getInteractionList,
  getInteractionDetail,
  createInteraction,
  replyInteraction,
  closeInteraction,
  reopenInteraction,
  deleteInteraction
} from '@/api/interaction'

const state = {
  list: [],
  total: 0,
  currentInteraction: null,
  listLoading: false,
  detailLoading: false
}

const mutations = {
  SET_LIST: (state, { list, total }) => {
    state.list = list
    state.total = total
  },
  SET_CURRENT_INTERACTION: (state, interaction) => {
    state.currentInteraction = interaction
  },
  SET_LIST_LOADING: (state, loading) => {
    state.listLoading = loading
  },
  SET_DETAIL_LOADING: (state, loading) => {
    state.detailLoading = loading
  }
}

const actions = {
  // 获取互动列表
  async getList({ commit }, query) {
    commit('SET_LIST_LOADING', true)
    try {
      const { data } = await getInteractionList(query)
      commit('SET_LIST', {
        list: data.records,
        total: data.total
      })
      return data
    } finally {
      commit('SET_LIST_LOADING', false)
    }
  },

  // 获取互动详情
  async getDetail({ commit }, id) {
    commit('SET_DETAIL_LOADING', true)
    try {
      const { data } = await getInteractionDetail(id)
      commit('SET_CURRENT_INTERACTION', data)
      return data
    } finally {
      commit('SET_DETAIL_LOADING', false)
    }
  },

  // 创建互动
  async createInteraction({ dispatch }, interactionData) {
    const { data } = await createInteraction(interactionData)
    await dispatch('getList')
    return data
  },

  // 回复互动
  async replyInteraction({ dispatch }, { id, data }) {
    const response = await replyInteraction(id, data)
    await dispatch('getDetail', id)
    return response.data
  },

  // 关闭互动
  async closeInteraction({ dispatch }, id) {
    const { data } = await closeInteraction(id)
    await dispatch('getList')
    return data
  },

  // 重新打开互动
  async reopenInteraction({ dispatch }, id) {
    const { data } = await reopenInteraction(id)
    await dispatch('getList')
    return data
  },

  // 删除互动
  async deleteInteraction({ dispatch }, id) {
    const { data } = await deleteInteraction(id)
    await dispatch('getList')
    return data
  }
}

const getters = {
  interactionList: state => state.list,
  currentInteraction: state => state.currentInteraction,
  listLoading: state => state.listLoading,
  detailLoading: state => state.detailLoading
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
