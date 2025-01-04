<!-- src/views/user/profile/index.vue -->
<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <div slot="header">
        <span>个人信息</span>
      </div>
      <el-form :model="userInfo" label-width="100px">
        <el-form-item label="用户名">
          <span>{{ userInfo.username }}</span>
        </el-form-item>
        <el-form-item label="姓名">
          <span>{{ userInfo.name }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <span>{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserProfile',
  data() {
    return {
      userInfo: {
        username: '',
        name: '',
        role: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'role'
    ])
  },
  created() {
    this.userInfo = {
      username: this.name,
      name: this.name,
      role: this.role
    }
  }
}
</script>

<style lang="scss" scoped>
.user-profile {
  padding: 20px;

  .profile-card {
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
