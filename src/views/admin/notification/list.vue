<!--src/views/admin/notification/list.vue-->
<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>通知列表</span>
        <div class="header-buttons">
          <el-button style="margin-left: 10px;" type="info" @click="goToArchive">归档管理</el-button>
          <el-button type="primary" @click="handleCreate">发布新通知</el-button>
        </div>
      </div>

      <!-- 搜索筛选 -->
      <el-form :inline="true" :model="listQuery" class="filter-container" @submit.native.prevent>
        <el-form-item label="通知类型">
          <el-select v-model="listQuery.type" placeholder="全部" clearable @change="handleFilter">
            <el-option label="系统通知" value="system" />
            <el-option label="用户通知" value="user" />
            <el-option label="广播通知" value="broadcast" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知状态">
          <el-select v-model="listQuery.status" placeholder="全部" clearable @change="handleFilter">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">搜索</el-button>
          <el-button type="info" icon="el-icon-refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
        <el-table-column label="内容" prop="content" min-width="200" show-overflow-tooltip />
        <el-table-column label="类型" width="120">
          <template slot-scope="{row}">
            <el-tag :type="getNotificationTypeTag(row.type)">{{ formatType(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template slot-scope="{row}">
            <el-tag :type="getPriorityTag(row.priority)" size="mini">{{ formatPriority(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标" width="120">
          <template slot-scope="{row}">
            <span>{{ formatTarget(row.targetType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="{row}">
            <el-tag :type="getStatusTag(row.status)">{{ formatStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template slot-scope="{row}">
            <span>{{ formatTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="260" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>

            <!-- 根据状态显示不同的操作按钮 -->
            <el-button v-if="row.status === 'draft'" size="mini" type="success" @click="handlePublish(row)">发布</el-button>
            <el-button v-if="row.status === 'published'" size="mini" type="warning" @click="handleArchive(row)">归档</el-button>

            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script>
import { getNotificationList, deleteNotification, publishNotification, archiveNotification } from '@/api/notification'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'NotificationList',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        type: undefined,
        status: undefined
      },
      typeMap: {
        'system': '系统通知',
        'user': '用户通知',
        'broadcast': '广播通知'
      },
      statusMap: {
        'draft': '草稿',
        'published': '已发布',
        'archived': '已归档'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatType(type) {
      return this.typeMap[type] || type
    },
    formatStatus(status) {
      return this.statusMap[status] || status
    },
    formatPriority(priority) {
      const priorityMap = {
        0: '普通',
        1: '重要',
        2: '紧急'
      }
      return priorityMap[priority] || priority
    },
    formatTarget(targetType) {
      const targetMap = {
        'all': '所有用户',
        'roles': '指定角色',
        'users': '指定用户'
      }
      return targetMap[targetType] || targetType
    },
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      if (isNaN(date.getTime())) return '';

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
    getNotificationTypeTag(type) {
      const typeTagMap = {
        'system': 'primary',
        'user': 'success',
        'broadcast': 'warning'
      }
      return typeTagMap[type] || ''
    },
    getStatusTag(status) {
      const statusTagMap = {
        'draft': 'info',
        'published': 'success',
        'archived': 'warning'
      }
      return statusTagMap[status] || ''
    },
    getPriorityTag(priority) {
      const priorityTagMap = {
        0: 'info',
        1: 'warning',
        2: 'danger'
      }
      return priorityTagMap[priority] || ''
    },
    async getList() {
      this.listLoading = true
      try {
        const res = await getNotificationList(this.listQuery)
        if (res.code === 200) {
          this.list = res.data.records || []
          this.total = res.data.total || 0
        } else {
          throw new Error(res.message || '获取通知列表失败')
        }
      } catch (error) {
        console.error('获取通知列表失败:', error)
        this.$message.error('获取通知列表失败')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetFilter() {
      this.listQuery = {
        page: 1,
        limit: 20,
        type: undefined,
        status: undefined
      }
      this.getList()
    },
    handleCreate() {
      this.$router.push('/notification/create')
    },
    handleUpdate(row) {
      this.$router.push(`/notification/edit/${row.id}`)
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该通知?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await deleteNotification(row.id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          throw new Error(res.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除通知失败:', error)
          this.$message.error(error.message || '删除失败')
        }
      }
    },
    async handlePublish(row) {
      try {
        await this.$confirm('确认发布该通知?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        const res = await publishNotification(row.id)
        if (res.code === 200) {
          this.$message.success(res.data || '发布成功')
          this.getList()
        } else {
          throw new Error(res.message || '发布失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('发布通知失败:', error)
          this.$message.error(error.message || '发布失败')
        }
      }
    },
    async handleArchive(row) {
      try {
        await this.$confirm('确认归档该通知?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })

        const res = await archiveNotification(row.id)
        if (res.code === 200) {
          this.$message.success('归档成功')
          this.getList()
        } else {
          throw new Error(res.message || '归档失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('归档通知失败:', error)
          this.$message.error(error.message || '归档失败')
        }
      }
    },
    goToArchive() {
      this.$router.push('/notification/archive')
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 20px;
}

.header-buttons {
  float: right;
  display: flex;
}
</style>
