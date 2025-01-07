// src/views/news/list.vue
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
          <span class="link-type" @click="handleUpdate(row)">{{ row.title }}</span>
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
          <span>{{ row.publishTime | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="temp.type" class="filter-item">
            <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <markdown-editor v-model="temp.content" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="temp.author" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getNewsList, createNews, updateNews, deleteNews, publishNews } from '@/api/news'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import MarkdownEditor from '@/components/Markdown/editor'

export default {
  name: 'NewsList',
  components: { Pagination, MarkdownEditor },
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
      temp: {
        id: undefined,
        title: '',
        content: '',
        type: 'news',
        status: 0,
        author: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
        author: [{ required: true, message: '作者不能为空', trigger: 'blur' }]
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
    resetTemp() {
      this.temp = {
        id: undefined,
        title: '',
        content: '',
        type: 'news',
        status: 0,
        author: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async createData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          try {
            await createNews(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } catch (error) {
            console.error('创建失败:', error)
          }
        }
      })
    },
    async updateData() {
      this.$refs['dataForm'].validate(async (valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          try {
            await updateNews(tempData.id, tempData)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          } catch (error) {
            console.error('更新失败:', error)
          }
        }
      })
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
