<!--src/views/university-admin/news/list.vue-->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="标题/内容"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.type" placeholder="类型" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        发布新闻
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="标题" min-width="150px">
        <template slot-scope="{row}">
          <router-link :to="'/university-admin/news/detail/'+row.id" class="link-type">
            <span>{{ row.title }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="getTypeTagType(row.type)">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="作者" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.author }}</span>
        </template>
      </el-table-column>
      <el-table-column label="浏览量" width="95" align="center">
        <template slot-scope="{row}">
          <span>{{ row.viewCount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="160px" align="center">
        <template slot-scope="{row}">
          <span>{{ formatDate(row.publishTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <div class="operation-buttons">
            <!-- 只保留编辑按钮直接显示 -->
            <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>

            <!-- 使用下拉菜单整合其他所有按钮 -->
            <el-dropdown trigger="click" @command="handleCommand($event, row)">
              <el-button size="mini" type="info">
                更多 <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <!-- 发布按钮移到下拉菜单中，只在草稿状态显示 -->
                <el-dropdown-item v-if="row.status === 0" command="publish">发布</el-dropdown-item>
                <el-dropdown-item command="view">查看</el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <span style="color: #F56C6C;">删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
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
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { parseTime } from '@/utils'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'UniversityAdminNewsList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 10,
        type: undefined,
        keyword: undefined,
        status: undefined,
        universityId: undefined
      },
      typeOptions: [
        { label: '新闻动态', value: 'news' },
        { label: '通知公告', value: 'notice' },
        { label: '政策文件', value: 'policy' },
        { label: '常见问题', value: 'faq' },
        { label: '招生咨询', value: 'consult' }
      ],
      statusOptions: [
        { label: '草稿', value: 0 },
        { label: '已发布', value: 1 }
      ]
    }
  },
  computed: {
    ...mapState({
      list: state => state.news.list,
      total: state => state.news.total,
      listLoading: state => state.news.listLoading
    }),
    universityId() {
      // 获取当前高校管理员的高校ID
      // 在实际项目中，应该从用户信息或store中获取
      return this.$store.getters.universityId || 1
    }
  },
  created() {
    // 设置高校ID
    this.listQuery.universityId = this.universityId
    this.getList()
  },
  methods: {
    ...mapActions({
      fetchNewsList: 'news/getList',
      deleteNewsAction: 'news/deleteNews',
      publishNewsAction: 'news/publishNews'
    }),

    async getList() {
      try {
        await this.fetchNewsList(this.listQuery)
      } catch (error) {
        console.error('获取新闻列表失败:', error)
        this.$message.error('获取新闻列表失败')
      }
    },

    formatDate(time) {
      if (!time) return ''
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    },

    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    getTypeTagType(type) {
      const typeMap = {
        'news': 'primary',
        'notice': 'success',
        'policy': 'info',
        'faq': 'warning',
        'consult': ''
      }
      return typeMap[type] || ''
    },

    getTypeLabel(type) {
      const labelMap = {
        'news': '新闻动态',
        'notice': '通知公告',
        'policy': '政策文件',
        'faq': '常见问题',
        'consult': '招生咨询'
      }
      return labelMap[type] || type
    },

    handleCreate() {
      this.$router.push('/university-admin/news/create')
    },

    handleUpdate(row) {
      this.$router.push(`/university-admin/news/edit/${row.id}`)
    },

    handleView(row) {
      this.$router.push(`/university-admin/news/detail/${row.id}`)
    },

    // 处理下拉菜单命令
    handleCommand(command, row) {
      if (command === 'view') {
        this.handleView(row)
      } else if (command === 'delete') {
        this.handleDelete(row)
      } else if (command === 'publish') {
        this.handlePublish(row)
      }
    },

    async handlePublish(row) {
      try {
        await this.$confirm('确认发布该新闻?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.publishNewsAction(row.id)
        this.$message({
          type: 'success',
          message: '发布成功!'
        })
        // 重新获取列表数据以更新状态
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('发布新闻失败:', error)
          this.$message.error('发布失败: ' + (error.message || '未知错误'))
        }
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该新闻?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.deleteNewsAction(row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        // 重新获取列表数据
        this.getList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除新闻失败:', error)
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding-bottom: 10px;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
  margin-right: 10px;
}
.link-type {
  color: #409EFF;
  text-decoration: none;
}
/* 操作按钮样式 */
.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
</style>
