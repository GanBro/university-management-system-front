// src/store/modules/news.js
import { getNewsList, getNewsDetail, createNews, updateNews, deleteNews, publishNews, increaseViewCount } from '@/api/news'

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
  },
  INCREMENT_VIEW_COUNT: (state) => {
    if (state.currentNews) {
      state.currentNews.viewCount = (state.currentNews.viewCount || 0) + 1
    }
  }
}

const actions = {
  async getList({ commit }, query) {
    commit('SET_LIST_LOADING', true)
    try {
      const { data } = await getNewsList(query)

      if (data) {
        commit('SET_LIST', {
          list: data.records || [],
          total: data.total || 0
        })
      } else {
        commit('SET_LIST', { list: [], total: 0 })
      }

      return data
    } catch (error) {
      console.error('获取新闻列表失败:', error)
      commit('SET_LIST', { list: [], total: 0 })
      throw error
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
    } catch (error) {
      console.error('获取新闻详情失败:', error)
      throw error
    } finally {
      commit('SET_DETAIL_LOADING', false)
    }
  },

  async createNews({ dispatch }, newsData) {
    try {
      const response = await createNews(newsData)
      return response
    } catch (error) {
      console.error('创建新闻失败:', error)
      throw error
    }
  },

  async updateNews({ dispatch }, { id, data }) {
    try {
      const response = await updateNews(id, data)
      return response
    } catch (error) {
      console.error('更新新闻失败:', error)
      throw error
    }
  },

  async deleteNews({ dispatch }, id) {
    try {
      const response = await deleteNews(id)
      return response
    } catch (error) {
      console.error('删除新闻失败:', error)
      throw error
    }
  },

  async publishNews({ dispatch }, id) {
    try {
      const response = await publishNews(id)
      return response
    } catch (error) {
      console.error('发布新闻失败:', error)
      throw error
    }
  },

  // 添加增加浏览量的action
  async increaseViewCount({ commit, state }, id) {
    try {
      // 在UI上立即更新浏览量，提高用户体验
      commit('INCREMENT_VIEW_COUNT')

      // 异步调用API更新服务器端浏览量
      await increaseViewCount(id)

      return true
    } catch (error) {
      console.error('增加浏览量失败:', error)
      // 这里不抛出错误，因为浏览量更新失败不应影响用户体验
      return false
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
