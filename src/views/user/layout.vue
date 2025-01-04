<!-- src/views/user/layout.vue -->
<template>
  <div class="user-layout">
    <header class="header">
      <div class="logo">全国高等院校信息系统</div>
      <div class="nav">
        <router-link to="/user/home">首页</router-link>
        <router-link to="/user/profile">个人中心</router-link>
        <a @click="handleLogout">退出登录</a>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="footer">
      <p>© 2024 全国高等院校信息系统</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'UserLayout',
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
  display: flex;
  flex-direction: column;

  .header {
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      font-size: 20px;
      font-weight: bold;
    }

    .nav {
      a {
        margin-left: 20px;
        color: #333;
        text-decoration: none;

        &:hover {
          color: #409EFF;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    padding: 20px;
    background: #f0f2f5;
  }

  .footer {
    background: #fff;
    padding: 20px;
    text-align: center;
    color: #666;
  }
}
</style>
