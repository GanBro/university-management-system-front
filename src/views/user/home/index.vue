<!-- src/views/user/home/index.vue -->
<template>
  <div class="user-home">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <h2>欢迎使用全国高等院校信息系统</h2>
          <p>您好，{{ name }}！</p>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>快速导航</span>
          </div>
          <div class="quick-nav">
            <el-button type="text" @click="$router.push('/user/profile')">个人信息</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserHome',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.user-home {
  padding: 20px;

  .welcome-card {
    text-align: center;
    margin-bottom: 20px;

    h2 {
      margin-bottom: 10px;
    }
  }

  .mt-20 {
    margin-top: 20px;
  }

  .quick-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
