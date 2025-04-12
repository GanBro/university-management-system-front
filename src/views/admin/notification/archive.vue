<!--src/views/admin/notification/archive.vue-->
<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card-title">已归档通知</span>
        <el-button type="primary" size="small" icon="el-icon-back" @click="returnToList">返回通知列表</el-button>
      </div>

      <!-- 搜索筛选 -->
      <el-form :inline="true" :model="listQuery" class="filter-container" @submit.native.prevent>
        <el-form-item label="通知类型">
          <el-select v-model="listQuery.type" placeholder="全部类型" clearable size="small" @change="handleFilter">
            <el-option label="用户通知" value="user" />
            <el-option label="广播通知" value="broadcast" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="listQuery.priority" placeholder="全部优先级" clearable size="small" @change="handleFilter">
            <el-option label="普通" :value="0" />
            <el-option label="重要" :value="1" />
            <el-option label="紧急" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="small" @click="handleFilter">搜索</el-button>
          <el-button icon="el-icon-refresh" size="small" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="加载中..."
        border
        fit
        highlight-current-row
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column label="标题" prop="title" min-width="120" show-overflow-tooltip />
        <el-table-column label="内容" prop="content" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="100" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getNotificationTypeTag(row.type)" size="small">{{ formatType(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="80" align="center">
          <template slot-scope="{row}">
            <el-tag :type="getPriorityTag(row.priority)" size="small">{{ formatPriority(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="目标" width="100" align="center">
          <template slot-scope="{row}">
            <span>{{ formatTarget(row.targetType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="归档时间" width="150" align="center">
          <template slot-scope="{row}">
            <span>{{ formatTime(row.updatedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" plain @click="handleDetail(row)">查看详情</el-button>
            <el-button type="warning" size="mini" plain @click="handleRestore(row)">恢复</el-button>
            <el-button type="danger" size="mini" plain @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
        layout="total, prev, pager, next, jumper"
        class="pagination-container"
      />
    </el-card>

    <!-- 通知详情对话框 -->
    <el-dialog
      title="通知详情"
      :visible.sync="detailDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      custom-class="notification-detail-dialog"
    >
      <div v-if="currentNotification" class="notification-detail">
        <h3>{{ currentNotification.title }}</h3>
        <div class="notification-meta">
          <div class="meta-item">
            <span class="label">通知类型：</span>
            <el-tag :type="getNotificationTypeTag(currentNotification.type)" size="small">
              {{ formatType(currentNotification.type) }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="label">优先级：</span>
            <el-tag :type="getPriorityTag(currentNotification.priority)" size="small">
              {{ formatPriority(currentNotification.priority) }}
            </el-tag>
          </div>
          <div class="meta-item">
            <span class="label">目标用户：</span>
            <span>{{ formatTarget(currentNotification.targetType) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">创建时间：</span>
            <span>{{ formatTime(currentNotification.createdAt) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">发布时间：</span>
            <span>{{ formatTime(currentNotification.publishTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">归档时间：</span>
            <span>{{ formatTime(currentNotification.updatedAt) }}</span>
          </div>
        </div>
        <div class="notification-content-box">
          <div class="content-label">通知内容：</div>
          <div class="notification-content-text">
            {{ currentNotification.content }}
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="warning" @click="handleRestoreFromDetail" v-if="currentNotification">恢复此通知</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getNotificationList, deleteNotification, restoreNotification } from '@/api/notification'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'NotificationArchive',
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
        priority: undefined,
        status: 'archived' // 固定为已归档
      },
      typeMap: {
        'user': '用户通知',
        'broadcast': '广播通知'
      },
      detailDialogVisible: false,
      currentNotification: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatType(type) {
      // 处理系统通知
      if (type === 'system') {
        return '广播通知'
      }
      return this.typeMap[type] || type
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
      // 处理系统通知
      if (type === 'system') {
        return 'warning' // 广播通知的标签
      }

      const typeTagMap = {
        'user': 'success',
        'broadcast': 'warning'
      }
      return typeTagMap[type] || ''
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
          throw new Error(res.message || '获取归档通知列表失败')
        }
      } catch (error) {
        console.error('获取归档通知列表失败:', error)
        this.$message.error('获取归档通知列表失败')
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
        priority: undefined,
        status: 'archived'
      }
      this.getList()
    },
    handleDetail(row) {
      this.currentNotification = row
      this.detailDialogVisible = true
    },
    async handleRestore(row) {
      try {
        await this.$confirm('确认将该通知恢复为发布状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await restoreNotification(row.id)
        if (res.code === 200) {
          this.$message.success('恢复成功')
          this.getList()
        } else {
          throw new Error(res.message || '恢复失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('恢复通知失败:', error)
          this.$message.error(error.message || '恢复失败')
        }
      }
    },
    async handleRestoreFromDetail() {
      if (!this.currentNotification) return

      try {
        await this.$confirm('确认将该通知恢复为发布状态?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const res = await restoreNotification(this.currentNotification.id)
        if (res.code === 200) {
          this.$message.success('恢复成功')
          this.detailDialogVisible = false
          this.getList()
        } else {
          throw new Error(res.message || '恢复失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('恢复通知失败:', error)
          this.$message.error(error.message || '恢复失败')
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认永久删除该通知?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'danger'
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
    returnToList() {
      this.$router.push('/notification/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.filter-container {
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

.notification-detail {
  padding: 10px;

  h3 {
    margin: 0 0 20px;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
  }

  .notification-meta {
    margin-bottom: 20px;
  }

  .meta-item {
    margin-bottom: 10px;
    display: flex;
    align-items: center;

    .label {
      width: 80px;
      color: #606266;
      font-weight: 500;
    }
  }

  .notification-content-box {
    background: #f8f8f8;
    border-radius: 4px;
    padding: 15px;
    margin-top: 15px;

    .content-label {
      font-weight: 500;
      margin-bottom: 10px;
      color: #606266;
    }

    .notification-content-text {
      line-height: 1.6;
      color: #303133;
      white-space: pre-line;
      font-size: 14px;
      min-height: 100px;
    }
  }
}

.el-button + .el-button {
  margin-left: 5px;
}

.clearfix::after {
  display: block;
  clear: both;
  content: "";
}

.clearfix .el-button {
  float: right;
}
</style>
