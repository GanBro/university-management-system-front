// src/router/index.js
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register/index.vue'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 用户端路由
  {
    path: '/user',
    component: () => import('@/views/user/layout'),
    redirect: '/user/home',
    hidden: true,
    children: [
      {
        path: 'home',
        name: 'UserHome',
        component: () => import('@/views/user/home'),
        meta: { title: '首页' }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/profile'),
        meta: { title: '个人中心' }
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
  {
    path: '/university',
    component: Layout,
    redirect: '/university/list',
    name: 'University',
    meta: {
      title: '高校管理',
      icon: 'university'
    },
    children: [
      {
        path: 'list',
        name: 'UniversityList',
        component: () => import('@/views/university/list'),
        meta: { title: '高校列表' }
      },
      {
        path: 'create',
        name: 'UniversityCreate',
        component: () => import('@/views/university/form'),
        meta: { title: '添加高校' }
      },
      {
        path: 'edit/:id',
        name: 'UniversityEdit',
        component: () => import('@/views/university/form'),
        meta: { title: '编辑高校' },
        hidden: true
      },
      {
        path: 'detail/:id',
        name: 'UniversityDetail',
        component: () => import('@/views/university/detail'),
        meta: { title: '高校详情' },
        hidden: true
      }
    ]
  },

  {
    path: '/system',
    component: Layout,
    redirect: '/system/user/list',
    name: 'System',
    meta: {
      title: '用户管理',
      icon: 'user'
    },
    children: [
      {
        path: 'user/list',
        name: 'UserList',
        component: () => import('@/views/system/user/list'),
        meta: { title: '用户列表' }
      },
      {
        path: 'user/create',
        name: 'UserCreate',
        component: () => import('@/views/system/user/form'),
        meta: { title: '添加用户' }
      },
      {
        path: 'user/edit/:id',
        name: 'UserEdit',
        component: () => import('@/views/system/user/form'),
        meta: { title: '编辑用户' },
        hidden: true
      },
      {
        path: 'user/detail/:id',
        name: 'UserDetail',
        component: () => import('@/views/system/user/detail'),
        meta: { title: '用户详情' },
        hidden: true
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
