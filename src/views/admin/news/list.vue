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
        新增
      </el-button>
    </div>

    <el-table
      :key="tableKey"
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
          <span class="link-type" @click="handleDetail(row)">{{ row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="关联学校" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.university ? row.university.name : '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.type | typeFilter">
            {{ row.type | typeLabel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusLabel }}
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
          <span>{{ row.publishTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status===0" size="mini" type="success" @click="handlePublish(row)">
            发布
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
import { getNewsList, deleteNews, publishNews } from '@/api/news'
import { getUniversityList } from '@/api/university'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'NewsList',
  components: { Pagination },
  directives: { waves },
  filters: {
    typeFilter(type) {
      const typeMap = {
        news: 'primary',
        notice: 'success',
        policy: 'info',
        faq: 'warning',
        consult: ''
      }
      return typeMap[type]
    },
    typeLabel(type) {
      const typeMap = {
        news: '新闻动态',
        notice: '通知公告',
        policy: '政策文件',
        faq: '常见问题',
        consult: '招生咨询'
      }
      return typeMap[type]
    },
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success'
      }
      return statusMap[status]
    },
    statusLabel(status) {
      const statusMap = {
        0: '草稿',
        1: '已发布'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        type: undefined,
        keyword: undefined,
        status: undefined
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
      ],
      universities: []
    }
  },
  created() {
    this.getList()
    this.getUniversities()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getNewsList(this.listQuery)
        this.list = data.records
        this.total = data.total
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/news/create')
    },
    handleUpdate(row) {
      this.$router.push(`/news/edit/${row.id}`)
    },
    async handleDelete(row) {
      this.$confirm('确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteNews(row.id)
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        } catch (error) {
          console.error('删除失败:', error)
        }
      })
    },
    async handlePublish(row) {
      try {
        await publishNews(row.id)
        this.$notify({
          title: '成功',
          message: '发布成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
      } catch (error) {
        console.error('发布失败:', error)
      }
    },
    async getUniversities() {
      try {
        const { data } = await getUniversityList({ limit: 1000 })
        this.universities = data.records || []
      } catch (error) {
        console.error('获取学校列表失败:', error)
        this.$message.error('获取学校列表失败')
      }
    },
    handleDetail(row) {
      this.$router.push(`/news/detail/${row.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding-bottom: 10px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
}
</style>
