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
          <span>{{ row.publishTime | formatDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status===0" size="mini" type="success" @click="handlePublish(row)">
            发布
          </el-button>
          <el-button size="mini" type="info" @click="handleView(row)">
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
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination/index.vue'
import { parseTime } from '@/utils'

export default {
  name: 'UniversityAdminNewsList',
  components: { Pagination },
  directives: { waves },
  filters: {
    formatDate(time) {
      if (!time) return ''
      return parseTime(time, '{y}-{m}-{d} {h}:{i}')
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        type: undefined,
        keyword: undefined,
        status: undefined,
        universityId: 1 // 假设当前管理员所属的高校 ID 为 1
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
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true

      // 模拟API请求
      setTimeout(() => {
        // 模拟数据
        this.list = [
          {
            id: 10,
            title: '北京大学2025年本科招生简章发布',
            type: 'notice',
            status: 1,
            author: '招生办',
            viewCount: 3245,
            publishTime: '2025-03-24 10:30:00',
            university: { id: 1, name: '北京大学' }
          },
          {
            id: 9,
            title: '我校学子在全国大学生创新创业大赛中获特等奖',
            type: 'news',
            status: 1,
            author: '新闻中心',
            viewCount: 1856,
            publishTime: '2025-03-22 14:15:00',
            university: { id: 1, name: '北京大学' }
          },
          {
            id: 8,
            title: '关于2025年高考咨询会安排的通知',
            type: 'notice',
            status: 1,
            author: '招生办',
            viewCount: 2765,
            publishTime: '2025-03-20 09:45:00',
            university: { id: 1, name: '北京大学' }
          },
          {
            id: 7,
            title: '校长在开学典礼上的重要讲话',
            type: 'news',
            status: 1,
            author: '宣传部',
            viewCount: 1987,
            publishTime: '2025-03-15 16:20:00',
            university: { id: 1, name: '北京大学' }
          },
          {
            id: 6,
            title: '2025年奖学金申请指南',
            type: 'policy',
            status: 0,
            author: '学生工作处',
            viewCount: 0,
            publishTime: null,
            university: { id: 1, name: '北京大学' }
          }
        ]
        this.total = 50
        this.listLoading = false
      }, 500)
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

    async handlePublish(row) {
      try {
        await this.$confirm('确认发布该新闻?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        this.$message({
          type: 'success',
          message: '发布成功!'
        })
        row.status = 1
        row.publishTime = new Date().toISOString()
      } catch (error) {
        console.log(error)
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该新闻?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        this.$message({
          type: 'success',
          message: '删除成功!'
        })

        const index = this.list.findIndex(item => item.id === row.id)
        if (index !== -1) {
          this.list.splice(index, 1)
        }
      } catch (error) {
        console.log(error)
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
</style>
