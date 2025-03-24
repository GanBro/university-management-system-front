<!-- src/layout/components/Sidebar/index.vue -->
<template>
  <div :class="{'has-logo':showLogo}">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in filteredRoutes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'

export default {
  components: { SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar',
      'userId'
    ]),
    routes() {
      return this.$router.options.routes
    },
    // 添加新的计算属性，根据用户角色过滤路由
    filteredRoutes() {
      // 获取当前用户角色
      const role = this.$store.state.user.role

      // 如果没有角色信息，返回空数组
      if (!role) {
        return []
      }

      // 过滤路由，只显示对应角色的路由
      return this.routes.filter(route => {
        // 没有meta或roles的路由对所有人可见
        if (!route.meta || !route.meta.roles) {
          return true
        }

        // 检查当前用户角色是否在路由允许的角色列表中
        return route.meta.roles.includes(role)
      })
    },
    activeMenu() {
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
