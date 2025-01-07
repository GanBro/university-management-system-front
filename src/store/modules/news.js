import { getNewsList, getNewsDetail, createNews, updateNews, deleteNews, publishNews } from '@/api/news'

const state = {
  list: [],
  total: 0,
  currentNews: null,
  listLoading: false,
  detailLoading: false
}

const mutations = {
  SET_LIST: (state, { list, total }) => {
    state.list = list
    state.total = total
  },
  SET_CURRENT_NEWS: (state, news) => {
    state.currentNews = news
  },
  SET_LIST_LOADING: (state, loading) => {
    state.listLoading = loading
  },
  SET_DETAIL_LOADING: (state, loading) => {
    state.detailLoading = loading
  }
}

const actions = {
  async getList({ commit }, query) {
    commit('SET_LIST_LOADING', true)
    try {
      const { data } = await getNewsList(query)
      commit('SET_LIST', {
        list: data.records,
        total: data.total
      })
    } finally {
      commit('SET_LIST_LOADING', false)
    }
  },

  async getDetail({ commit }, id) {
    commit('SET_DETAIL_LOADING', true)
    try {
      const { data } = await getNewsDetail(id)
      commit('SET_CURRENT_NEWS', data)
      return data
    } finally {
      commit('SET_DETAIL_LOADING', false)
    }
  },

  async createNews({ dispatch }, newsData) {
    await createNews(newsData)
    return dispatch('getList')
  },

  async updateNews({ dispatch }, { id, data }) {
    await updateNews(id, data)
    return dispatch('getList')
  },

  async deleteNews({ dispatch }, id) {
    await deleteNews(id)
    return dispatch('getList')
  },

  async publishNews({ dispatch }, id) {
    await publishNews(id)
    return dispatch('getList')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
