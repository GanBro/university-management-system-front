// src/permission.js
import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      try {
        const userInfo = await store.dispatch('user/getInfo')
        const { role } = userInfo

        // 修改路由判断逻辑，增加对高校管理员角色的处理
        if (role === 'user') {
          if (to.path.startsWith('/user')) {
            next()
          } else {
            next('/user/home')
          }
        } else if (role === 'admin') {
          if (!to.path.startsWith('/user') && !to.path.startsWith('/university-admin')) {
            next()
          } else {
            next('/')
          }
        } else if (role === 'university_admin') {
          // 特殊处理设置页面
          if (to.path === '/settings') {
            console.log('高校管理员访问设置页面，允许通过');
            next()
          } else if (to.path.startsWith('/university-admin')) {
            console.log('高校管理员访问高校管理路由，允许通过');
            next()
          } else {
            console.log('高校管理员访问其他路由，重定向到高校管理首页');
            next('/university-admin/dashboard')
          }
        } else {
          // 未知角色
          next('/user/home')
        }
      } catch (error) {
        await store.dispatch('user/resetToken')
        next(`/login?redirect=${to.path}`)
      } finally {
        NProgress.done()
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
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
