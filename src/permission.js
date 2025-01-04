// src/permission.js
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/register'] // no redirect whitelist
//
// // src/permission.js
// router.beforeEach(async(to, from, next) => {
//   NProgress.start()
//   document.title = getPageTitle(to.meta.title)
//   const hasToken = getToken()
//   console.log('路由守卫 - token状态:', hasToken)
//
//   if (hasToken) {
//     if (to.path === '/login') {
//       next({ path: '/' })
//       NProgress.done()
//     } else {
//       try {
//         // 获取用户信息
//         const { role } = await store.dispatch('user/getInfo')
//         console.log('路由守卫 - 用户角色:', role)
//
//         // 根据角色进行路由
//         if (role === 'admin') {
//           if (to.path.startsWith('/user')) {
//             next('/')
//           } else {
//             next()
//           }
//         } else {
//           if (!to.path.startsWith('/user')) {
//             next('/user/home')
//           } else {
//             next()
//           }
//         }
//       } catch (error) {
//         // 错误处理
//         console.error('路由守卫 - 错误:', error)
//         await store.dispatch('user/resetToken')
//         Message.error(error || '系统错误')
//         next(`/login?redirect=${to.path}`)
//       } finally {
//         NProgress.done()
//       }
//     }
//   } else {
//     if (whiteList.indexOf(to.path) !== -1) {
//       next()
//     } else {
//       next(`/login?redirect=${to.path}`)
//       NProgress.done()
//     }
//   }
// })

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
        console.log('路由守卫 - 完整用户信息:', userInfo)
        const { role } = userInfo
        console.log('路由守卫 - 用户角色:', role)
        console.log('路由守卫 - 目标路径:', to.path)

        // 根据角色进行路由
        if (role === 'admin') {
          if (to.path.startsWith('/user')) {
            console.log('管理员访问用户路径，重定向到首页')
            next('/')
          } else {
            console.log('管理员访问管理路径，允许通过')
            next()
          }
        } else {
          if (!to.path.startsWith('/user')) {
            console.log('普通用户访问非用户路径，重定向到用户首页')
            next('/user/home')
          } else {
            console.log('普通用户访问用户路径，允许通过')
            next()
          }
        }
      } catch (error) {
        // 错误处理
        console.error('路由守卫 - 详细错误:', error)
        await store.dispatch('user/resetToken')
        Message.error(error || '系统错误')
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
