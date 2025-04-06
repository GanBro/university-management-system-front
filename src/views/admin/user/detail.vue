<!-- src/views/user/detail.vue -->
<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>用户详情</span>
        <el-button style="float: right; margin-left: 10px;" @click="$router.push('/system/user/list')">返回</el-button>
      </div>

      <el-form label-width="120px" v-loading="loading">
        <el-form-item label="用户头像">
          <el-avatar
            :size="100"
            :src="userInfo.avatar"
            @error="() => true"
          >
            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
          </el-avatar>
        </el-form-item>

        <el-form-item label="用户名">
          <span>{{ userInfo.username }}</span>
        </el-form-item>

        <el-form-item label="邮箱">
          <span>{{ userInfo.email }}</span>
        </el-form-item>

        <el-form-item label="角色">
          <el-tag
            :type="userInfo.role === 'admin' ? 'danger' :
                   userInfo.role === 'university_admin' ? 'warning' : 'success'"
          >
            {{ userInfo.role === 'admin' ? '管理员' :
            userInfo.role === 'university_admin' ? '高校管理员' : '普通用户' }}
          </el-tag>
        </el-form-item>

        <el-form-item v-if="userInfo.role === 'university_admin'" label="管理高校">
          <span>{{ userInfo.universityName || '未分配高校' }}</span>
        </el-form-item>

        <el-form-item label="创建时间">
          <span>{{ formatTime(userInfo.createdAt) }}</span>
        </el-form-item>

        <el-form-item label="更新时间">
          <span>{{ formatTime(userInfo.updatedAt) }}</span>
        </el-form-item>

        <el-form-item label="最后登录时间">
          <span>{{ formatTime(userInfo.lastLogin) }}</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getUserDetail } from '@/api/user'

export default {
  name: 'UserDetail',
  data() {
    return {
      loading: true,
      userInfo: {
        userId: '',
        username: '',
        email: '',
        role: '',
        avatar: '',
        createdAt: '',
        updatedAt: '',
        lastLogin: '',
        universityId: '',
        universityName: ''
      }
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    formatTime(time) {
      if (!time) return '暂无'
      const date = new Date(time)
      return date.toLocaleString()
    },
    async getDetail() {
      const userId = this.$route.params.id
      if (!userId) {
        this.$message.error('用户ID不能为空')
        this.$router.push('/system/user/list')
        return
      }

      try {
        console.log('获取用户详情, userId:', userId)
        const response = await getUserDetail(userId)
        console.log('获取到的用户详情:', response)

        if (response.code === 200) {
          this.userInfo = response.data
        } else {
          throw new Error(response.message || '获取用户详情失败')
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        this.$message.error(error.message || '获取用户信息失败')
        this.$router.push('/system/user/list')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
