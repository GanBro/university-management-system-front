<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header">
        <span>用户详情</span>
        <el-button
          style="float: right; margin-left: 10px;"
          type="primary"
          size="small"
          @click="handleEdit"
        >
          编辑
        </el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="user-info">
            <img :src="userDetail.avatar || '/default-avatar.png'" class="user-avatar">
            <h3>{{ userDetail.username }}</h3>
            <p>{{ userDetail.role === 'admin' ? '管理员' : '普通用户' }}</p>
          </div>
        </el-col>
        <el-col :span="16">
          <el-descriptions title="基本信息" :column="2">
            <el-descriptions-item label="邮箱">{{ userDetail.email }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="userDetail.status === 'active' ? 'success' : 'info'">
                {{ userDetail.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ userDetail.createdTime }}</el-descriptions-item>
            <el-descriptions-item label="最后登录时间">{{ userDetail.lastLoginTime }}</el-descriptions-item>
          </el-descriptions>

          <el-divider></el-divider>

          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in userDetail.activities"
              :key="index"
              :timestamp="activity.time"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-col>
      </el-row>
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
      userDetail: {
        username: '',
        email: '',
        role: '',
        status: '',
        avatar: '',
        createdTime: '',
        lastLoginTime: '',
        activities: []
      }
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      try {
        const { data } = await getUserDetail(this.$route.params.id)
        this.userDetail = data
      } catch (error) {
        console.error('Failed to get user detail:', error)
      } finally {
        this.loading = false
      }
    },
    handleEdit() {
      this.$router.push(`/system/user/edit/${this.$route.params.id}`)
    }
  }
}
</script>

<style scoped>
.user-info {
  text-align: center;
  padding: 20px;
}
.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}
</style>
