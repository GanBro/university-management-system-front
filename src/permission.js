// src/permission.js
import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register'] // no redirect whitelist

// permission.js
router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  const hasToken = getToken()
  console.log('路由守卫 - token状态:', hasToken)

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        // 获取用户信息并打印完整的返回数据
        const userInfo = await store.dispatch('user/getInfo')
        const { role } = userInfo

        // 根据角色进行路由
        if (role === 'admin') {
          if (to.path.startsWith('/user')) {
            next('/')
          } else {
            next()
          }
        } else {
          if (!to.path.startsWith('/user')) {
            next('/user/home')
          } else {
            next()
          }
        }
      } catch (error) {
        // 错误处理
        await store.dispatch('user/resetToken')
        next(`/login?redirect=${to.path}`)
      } finally {
        NProgress.done()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})
router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
