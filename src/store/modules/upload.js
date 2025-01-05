// src/store/modules/upload.js
import request from '@/utils/request'

const state = {
  uploadUrl: '/upload',
  uploadLoading: false
}

const mutations = {
  SET_UPLOAD_LOADING: (state, loading) => {
    state.uploadLoading = loading
  }
}

const actions = {
  uploadFile({ commit }, { file }) {
    return new Promise((resolve, reject) => {
      commit('SET_UPLOAD_LOADING', true)

      const formData = new FormData()
      formData.append('file', file)

      request({
        url: state.uploadUrl,
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          if (response.code === 200) {
            resolve(response)
          } else {
            reject(new Error(response.message || '上传失败'))
          }
        })
        .catch(error => {
          reject(error)
        })
        .finally(() => {
          commit('SET_UPLOAD_LOADING', false)
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
