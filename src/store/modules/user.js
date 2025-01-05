// src/store/modules/user.js
import { login, getInfo, getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    role: ''
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
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLE: (state, role) => {
    state.role = role
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        console.log('登录响应:', response)
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve(data)
      }).catch(error => {
        console.error('登录失败:', error)
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    console.log('开始获取用户信息, 当前状态:', {
      token: state.token,
      role: state.role,
      name: state.name
    })

    // 如果已经有用户信息，直接返回
    if (state.name && state.role) {
      console.log('已有用户信息，直接返回:', {
        name: state.name,
        role: state.role
      })
      return Promise.resolve({ name: state.name, role: state.role })
    }

    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        console.log('获取到的用户信息:', data)

        if (!data || !data.user) {
          reject('Verification failed, please Login again.')
          return
        }

        // 从 data.user 中解构数据
        const { username: name, avatar, role } = data.user

        console.log('设置用户信息:', {
          name,
          role,
          avatar
        })

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLE', role)

        // 返回处理后的用户信息，包括角色信息
        resolve({ name, role, avatar })
      }).catch(error => {
        console.error('获取用户信息失败:', error)
        reject(error)
      })
    })
  },
  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      removeToken() // must remove  token  first
      resetRouter()
      commit('RESET_STATE')
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },
  // 获取用户列表
  getUserList({ commit }, query) {
    return new Promise((resolve, reject) => {
      getUserList(query).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 创建用户
  createUser({ commit }, data) {
    return new Promise((resolve, reject) => {
      createUser(data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 更新用户
  updateUser({ commit }, { id, data }) {
    return new Promise((resolve, reject) => {
      updateUser(id, data).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 删除用户
  deleteUser({ commit }, id) {
    return new Promise((resolve, reject) => {
      deleteUser(id).then(response => {
        resolve(response)
      }).catch(error => {
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
