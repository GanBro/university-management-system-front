<!--src/views/admin/notification/list.vue-->
<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>通知列表</span>
        <el-button style="float: right;" type="primary" @click="handleCreate">发布新通知</el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="标题" prop="title" />
        <el-table-column label="类型" width="120">
          <template slot-scope="{row}">
            <span>{{ formatType(row.type) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template slot-scope="{row}">
            <span>{{ formatStatus(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" />
        <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
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
import { getNotificationList, deleteNotification } from '@/api/notification'
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
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getNotificationList(this.listQuery)
        this.list = data.records
        this.total = data.total
      } catch (error) {
        console.error('获取通知列表失败:', error)
      } finally {
        this.listLoading = false
      }
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
        await deleteNotification(row.id)
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        console.error('删除通知失败:', error)
      }
    }
  }
}
</script>
