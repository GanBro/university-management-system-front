<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>消息记录</span>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="通知标题" prop="notification.title" />
        <el-table-column label="接收用户" prop="user.username" />
        <el-table-column label="状态" prop="status" />
        <el-table-column label="创建时间" prop="createdAt" />
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
import { getMessageLogList } from '@/api/message'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'MessageLog',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        status: undefined
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getMessageLogList(this.listQuery)
        this.list = data.records
        this.total = data.total
      } catch (error) {
        console.error('获取消息记录失败:', error)
      } finally {
        this.listLoading = false
      }
    }
  }
}
</script>
