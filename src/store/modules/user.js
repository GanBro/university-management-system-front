// src/store/modules/user.js
import { login, getInfo, getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    role: '',
    userId: null // 用户ID字段
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER: (state, user) => {
    state.name = user.username
    state.role = user.role
    state.avatar = user.avatar
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  }
}

const actions = {
  // 用户登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          console.log('登录响应:', response)
          const { data } = response
          commit('SET_TOKEN', data.token)
          commit('SET_USER_ID', data.userId) // 存储 userId
          setToken(data.token)
          console.log('Token 已保存到 cookie:', data.token) // 添加日志
          resolve(data)
        })
        .catch(error => {
          console.error('登录失败:', error)
          reject(error)
        })
    })
  },

  // 获取用户信息
  getInfo({ commit, state }) {
    if (state.name && state.role && state.userId) {
      return Promise.resolve({
        name: state.name,
        role: state.role,
        userId: state.userId
      })
    }

    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then(response => {
          console.log('getInfo响应:', response)
          const { data } = response
          if (!data || !data.user) {
            reject('验证失败，请重新登录')
            return
          }

          const { username: name, avatar, role, userId } = data.user
          console.log('提交用户信息:', { name, role, avatar, userId })

          commit('SET_USER', { username: name, role, avatar })
          commit('SET_USER_ID', userId)

          resolve(data.user)
        })
        .catch(error => {
          console.error('获取用户信息失败:', error)
          reject(error)
        })
    })
  },

  // 用户登出
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // 必须先移除 token
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // 重置 token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // 必须先移除 token
      commit('RESET_STATE')
      resolve()
    })
  },

  // 获取用户列表
  getUserList({ commit }, query) {
    return new Promise((resolve, reject) => {
      getUserList(query)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 创建用户
  createUser({ commit }, data) {
    return new Promise((resolve, reject) => {
      createUser(data)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 更新用户
  updateUser({ commit }, { id, data }) {
    return new Promise((resolve, reject) => {
      updateUser(id, data)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 删除用户
  deleteUser({ commit }, userId) {
    return new Promise((resolve, reject) => {
      deleteUser(userId)
        .then(response => {
          resolve(response)
        })
        .catch(error => {
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
