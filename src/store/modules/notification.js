// src/store/modules/notification.js
import { getUnreadCount } from '@/api/notification'

const state = {
  unreadCount: 0,
  hasUnreadNotifications: false
}

const mutations = {
  SET_UNREAD_COUNT: (state, count) => {
    state.unreadCount = count
    state.hasUnreadNotifications = count > 0
  },
  SET_HAS_UNREAD_NOTIFICATIONS: (state, hasUnread) => {
    state.hasUnreadNotifications = hasUnread
  }
}

const actions = {
  // 获取未读通知计数 - 确保传入userId
  getUnreadCount({ commit, rootGetters }) {
    // 从root store获取userId
    const userId = rootGetters.userId

    return new Promise((resolve, reject) => {
      if (!userId) {
        console.error('获取未读通知失败: 未找到用户ID')
        reject(new Error('未找到用户ID'))
        return
      }

      getUnreadCount(userId)
        .then(response => {
          if (response.code === 200) {
            const count = response.data
            commit('SET_UNREAD_COUNT', count)
            resolve(count)
          } else {
            reject(new Error(response.message || '获取未读通知数失败'))
          }
        })
        .catch(error => {
          console.error('获取未读通知数失败:', error)
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
