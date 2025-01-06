<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        placeholder="用户名"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.email"
        placeholder="邮箱"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.role" placeholder="角色" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加用户
      </el-button>
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleBatchDelete">
        批量删除
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户名" min-width="110">
        <template slot-scope="scope">
          <router-link :to="'/system/user/detail/'+scope.row.userId" class="link-type">
            <span>{{ scope.row.username }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" min-width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="110" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template slot-scope="scope">
          <span>{{ formatTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button size="mini" @click="handleDetail(row)">
            查看
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
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
  </div>
</template>

<script>
import { getUserList, deleteUser, batchDeleteUsers } from '@/api/user'
import Pagination from '@/components/Pagination'

export default {
  name: 'UserList',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        email: undefined,
        role: undefined
      },
      multipleSelection: [],
      roleOptions: [
        { value: 'admin', label: '管理员' },
        { value: 'user', label: '普通用户' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return date.toLocaleString()
    },
    async getList() {
      this.listLoading = true
      try {
        console.log('发送请求参数:', this.listQuery)
        const response = await getUserList(this.listQuery)
        console.log('获取到的响应:', response)

        if (response.code === 200) {
          this.list = response.data.records
          this.total = response.data.total
        } else {
          throw new Error(response.message || '获取用户列表失败')
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/system/user/create')
    },
    handleUpdate(row) {
      if (!row.userId) {
        this.$message.error('用户ID不能为空')
        return
      }
      this.$router.push(`/system/user/edit/${row.userId}`)
    },
    handleDetail(row) {
      if (!row.userId) {
        this.$message.error('用户ID不能为空')
        return
      }
      this.$router.push(`/system/user/detail/${row.userId}`)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async handleDelete(row) {
      if (!row.userId) {
        this.$message.error('用户ID不能为空')
        return
      }

      try {
        await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 修改这里，直接使用 response 而不是 response.data
        const response = await deleteUser(row.userId)
        if (response.code === 200) {
          this.$message.success('删除成功')
          this.getList()
        } else {
          throw new Error(response.message || '删除失败')
        }
      } catch (error) {
        if (error.toString().includes('cancel')) {
          return
        }
        console.error('删除用户失败:', error)
        this.$message.error(error.message || '删除失败')
      }
    },
    async handleBatchDelete() {
      if (!this.multipleSelection.length) {
        this.$message.warning('请选择要删除的用户')
        return
      }

      try {
        await this.$confirm('此操作将永久删除选中的用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const userIds = this.multipleSelection.map(item => item.userId)
        // 修改这里，直接使用 response 而不是 response.data
        const response = await batchDeleteUsers(userIds)

        if (response.code === 200) {
          this.$message.success('批量删除成功')
          this.getList()
        } else {
          throw new Error(response.message || '批量删除失败')
        }
      } catch (error) {
        if (error.toString().includes('cancel')) {
          return
        }
        console.error('批量删除用户失败:', error)
        this.$message.error(error.message || '批量删除失败')
      }
    }
  }
}
</script>

<style scoped>
.link-type {
  color: #409EFF;
  text-decoration: none;
}

.filter-container {
  padding-bottom: 10px;

  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}
</style>
