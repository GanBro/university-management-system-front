<!-- src/views/user/layout/index.vue -->
<template>
  <div class="user-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">全国高等院校信息系统</div>
          <div class="nav">
            <el-menu
              :default-active="activeMenu"
              mode="horizontal"
              router
            >
              <el-menu-item index="/user/home">首页</el-menu-item>
              <el-menu-item index="/user/profile">个人中心</el-menu-item>
            </el-menu>
            <el-button type="text" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>

      <el-footer>
        <p>© 2024 全国高等院校信息系统</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'UserLayout',
  computed: {
    activeMenu() {
      return this.$route.path
    }
  },
  methods: {
    handleLogout() {
      this.$store.dispatch('user/logout').then(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-layout {
  min-height: 100vh;

  .el-container {
    min-height: 100vh;
  }

  .el-header {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    padding: 0;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .logo {
        font-size: 20px;
        font-weight: bold;
        color: #303133;
      }

      .nav {
        display: flex;
        align-items: center;

        .el-menu {
          border: none;
          margin-right: 20px;
        }
      }
    }
  }

  .el-main {
    background-color: #f0f2f5;
    min-height: calc(100vh - 120px);
  }

  .el-footer {
    text-align: center;
    background: #fff;
    color: #666;
    height: 60px;
    line-height: 60px;
  }
}
</style>
