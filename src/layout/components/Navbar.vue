<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <!--todo: 通知功能高校管理员失效-->
      <!-- 添加通知图标 -->
      <div class="notification-container right-menu-item hover-effect" @click="goToNotifications">
        <el-badge :value="unreadNotificationCount" :hidden="!hasUnreadNotifications" class="notification-badge">
          <i class="el-icon-bell"></i>
        </el-badge>
      </div>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item @click.native="goToSettings">
            <i class="el-icon-setting"></i>
            设置
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">
              <i class="el-icon-switch-button"></i>
              登出
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  name: 'Navbar',
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'role',
      'unreadNotificationCount',
      'hasUnreadNotifications',
      'userId'
    ])
  },
  mounted() {
    // 加载通知数据
    this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      if (this.userId) {
        try {
          await this.$store.dispatch('notification/getUnreadCount')
        } catch (error) {
          console.error('获取通知状态失败:', error)
        }
      }
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    goToSettings() {
      console.log('尝试导航到设置页面, 当前角色:', this.role);

      // 检查该路由是否应该对当前角色可见
      const settingsRoute = this.$router.options.routes.find(
        route => route.path === '/settings'
      );

      console.log('设置路由配置:', settingsRoute);

      if (settingsRoute && settingsRoute.meta && settingsRoute.meta.roles) {
        console.log('设置路由可访问角色:', settingsRoute.meta.roles);
        console.log('当前用户角色是否有权限:', settingsRoute.meta.roles.includes(this.role));
      }

      // 使用try-catch代替Promise.catch
      try {
        // 直接导航到设置页面
        this.$router.push('/settings');
      } catch (err) {
        console.error('导航到设置页面出错:', err);
      }
    },
    goToNotifications() {
      // 根据角色导航到合适的通知页面
      if (this.role === 'user') {
        this.$router.push('/user/profile?tab=notifications');
      } else if (this.role === 'admin') {
        this.$router.push('/notification/list');
      } else if (this.role === 'university_admin') {
        this.$router.push('/university-admin/profile?tab=notifications');
      }
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .notification-container {
      position: relative;
      margin-right: 15px;

      .notification-badge {
        line-height: normal;
      }

      .el-icon-bell {
        font-size: 20px;
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
