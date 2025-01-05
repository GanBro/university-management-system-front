<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="高校名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select v-model="listQuery.province" placeholder="省份" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item"/>
      </el-select>
      <el-select v-model="listQuery.type" placeholder="类型" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in typeOptions" :key="item" :label="item" :value="item"/>
      </el-select>
      <el-select v-model="listQuery.level" placeholder="层次" clearable style="width: 120px" class="filter-item">
        <el-option v-for="item in levelOptions" :key="item" :label="item" :value="item"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加高校
      </el-button>
      <!-- 添加批量删除按钮 -->
      <el-button class="filter-item" type="danger" icon="el-icon-delete" @click="handleBatchDelete">
        批量删除
      </el-button>
      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        导出
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
      <el-table-column label="高校名称" min-width="200">
        <template slot-scope="scope">
          <router-link :to="'/university/detail/'+scope.row.id" class="link-type">
            <span>{{ scope.row.name }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="省份" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.province }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="层次" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.level }}</span>
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

    <!-- 导出配置对话框 -->
    <el-dialog
      title="导出配置"
      :visible.sync="exportDialogVisible"
      width="30%"
    >
      <el-form :model="exportConfig" label-width="100px">
        <el-form-item label="选择字段">
          <el-checkbox-group v-model="exportConfig.fields">
            <el-checkbox label="name">高校名称</el-checkbox>
            <el-checkbox label="province">省份</el-checkbox>
            <el-checkbox label="type">类型</el-checkbox>
            <el-checkbox label="level">层次</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="exportDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleExportConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUniversityList, deleteUniversity, batchDeleteUniversities, getUniversityOptions } from '@/api/university'
import Pagination from '@/components/Pagination'

export default {
  name: 'UniversityList',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        province: undefined,
        type: undefined,
        level: undefined
      },
      multipleSelection: [],
      typeOptions: [],
      levelOptions: [],
      provinceOptions: [],
      downloadLoading: false,
      // 导出相关配置
      exportDialogVisible: false,
      exportConfig: {
        fields: ['name', 'province', 'type', 'level']
      }
    }
  },
  created() {
    this.getList()
    this.getOptions()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const { data } = await getUniversityList(this.listQuery)
        this.list = data.records
        this.total = data.total
        this.listLoading = false
      } catch (error) {
        console.error('Failed to get university list:', error)
        this.listLoading = false
      }
    },
    async getOptions() {
      try {
        const { data } = await getUniversityOptions()
        this.typeOptions = data.types
        this.levelOptions = data.levels
        this.provinceOptions = data.provinces
      } catch (error) {
        console.error('Failed to get options:', error)
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/university/create')
    },
    handleUpdate(row) {
      this.$router.push(`/university/edit/${row.id}`)
    },
    handleDetail(row) {
      this.$router.push(`/university/detail/${row.id}`)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该高校?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteUniversity(row.id)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      } catch (error) {
        console.error('Failed to delete university:', error)
      }
    },
    async handleBatchDelete() {
      if (!this.multipleSelection.length) {
        this.$message({
          message: '请选择要删除的高校',
          type: 'warning'
        })
        return
      }
      try {
        await this.$confirm('确认删除选中的高校?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const ids = this.multipleSelection.map(item => item.id)
        await batchDeleteUniversities(ids)
        this.$message({
          type: 'success',
          message: '批量删除成功!'
        })
        this.getList()
      } catch (error) {
        console.error('Failed to batch delete universities:', error)
      }
    },
    handleDownload() {
      this.exportDialogVisible = true
    },
    async handleExportConfirm() {
      try {
        this.exportDialogVisible = false
        this.downloadLoading = true

        // 构建导出查询参数
        const exportQuery = {
          name: this.listQuery.name,
          province: this.listQuery.province,
          type: this.listQuery.type,
          level: this.listQuery.level,
          fields: this.exportConfig.fields
        }

        const loading = this.$loading({
          lock: true,
          text: '正在导出数据，请稍候...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
          await this.$store.dispatch('university/exportList', exportQuery)
          this.$message({
            message: '导出成功',
            type: 'success'
          })
        } finally {
          loading.close()
        }
      } catch (error) {
        this.$message({
          message: `导出失败: ${error.message}`,
          type: 'error'
        })
      } finally {
        this.downloadLoading = false
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
</style>
