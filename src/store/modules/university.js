import {
  getUniversityList,
  getUniversityDetail,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  exportUniversityList,
  getUniversityOptions,
  batchDeleteUniversities
} from '@/api/university'

const state = {
  list: {
    records: [],
    total: 0,
    size: 10,
    current: 1
  },
  currentUniversity: null,
  listLoading: false,
  detailLoading: false
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

  // 获取高校详情a
  getDetail({ commit }, id) {
    commit('SET_DETAIL_LOADING', true)
    return new Promise((resolve, reject) => {
      getUniversityDetail(id)
        .then(response => {
          const { data } = response
          commit('SET_CURRENT_UNIVERSITY', data)
          resolve(data)
        })
        .catch(error => {
          console.error('获取高校详情失败:', error)
          reject(error)
        })
        .finally(() => {
          commit('SET_DETAIL_LOADING', false)
        })
    })
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

  // 批量删除
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
      exportUniversityList(query)
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
