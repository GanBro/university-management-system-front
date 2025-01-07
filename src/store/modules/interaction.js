// src/store/modules/interaction.js
import {
  getInteractionList,
  getInteractionDetail,
  createInteraction,
  replyInteraction,
  closeInteraction,
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
    await createInteraction(interactionData)
    return dispatch('getList')
  },

  // 回复互动
  async replyInteraction({ dispatch }, { id, data }) {
    await replyInteraction(id, data)
    return dispatch('getList')
  },

  // 关闭互动
  async closeInteraction({ dispatch }, id) {
    await closeInteraction(id)
    return dispatch('getList')
  },

  // 删除互动
  async deleteInteraction({ dispatch }, id) {
    await deleteInteraction(id)
    return dispatch('getList')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
