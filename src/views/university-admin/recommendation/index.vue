<!--src/views/university-admin/recommendation/index.vue-->
<template>
  <div class="recommendation-management">
    <div class="page-header">
      <h2>专业推荐管理</h2>
      <el-button type="primary" @click="handleAdd">添加推荐</el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-item">
        <label>专业类别</label>
        <el-input v-model="searchForm.majorCategory" placeholder="请输入专业类别" clearable></el-input>
      </div>
      <div class="search-item">
        <label>评分范围</label>
        <el-select v-model="searchForm.ratingRange" placeholder="请选择" clearable>
          <el-option label="4分以上" value="4+" />
          <el-option label="3-4分" value="3-4" />
          <el-option label="3分以下" value="-3" />
        </el-select>
      </div>
      <div class="search-actions">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container" v-loading="loading">
      <el-table
        :data="recommendationList"
        style="width: 100%"
      >
        <el-table-column prop="majorCategory" label="专业类别" min-width="180" />
        <el-table-column label="推荐评分" width="120" align="center">
          <template slot-scope="scope">
            <span class="rating-value">{{ Number(scope.row.rating).toFixed(1) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="recommendationCount" label="推荐人次" width="120" align="center" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.recommendationCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <div class="total-info">共 {{ total }} 条</div>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="sizes, prev, pager, next, jumper"
        :total="total"
      />
      <div class="page-info">
        前往 <el-input v-model="jumpPage" class="jump-page" @keyup.enter.native="jumpToPage"></el-input> 页
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      :title="editDialogTitle"
      :visible.sync="editDialogVisible"
      width="500px"
    >
      <el-form :model="editForm" :rules="editRules" ref="editForm" label-width="100px">
        <el-form-item label="专业类别" prop="majorCategory">
          <el-input v-model="editForm.majorCategory"></el-input>
        </el-form-item>
        <el-form-item label="推荐评分" prop="rating">
          <el-input-number
            v-model="editForm.rating"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="5"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="推荐人次" prop="recommendationCount">
          <el-input-number v-model="editForm.recommendationCount" :min="0" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 删除确认框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <div>确定要删除"{{ deleteItem.majorCategory }}"的推荐记录吗？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmDelete">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入API函数
import { getMajorRecommendations } from '@/api/university'
import {
  getRecommendationRatingDetail,
  deleteRecommendationRating,
  getUniversityRecommendations,
  updateUniversityRecommendation
} from '@/api/recommendationRating'

export default {
  name: 'UniversityRecommendationManagement',
  data() {
    return {
      loading: false,
      jumpPage: '',

      // 搜索表单
      searchForm: {
        majorCategory: '',
        ratingRange: ''
      },

      // 表格数据
      recommendationList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,

      // 编辑表单
      editDialogVisible: false,
      editForm: {
        id: null,
        universityId: null,
        majorCategory: '',
        rating: 0,
        recommendationCount: 0
      },

      // 编辑表单验证规则
      editRules: {
        majorCategory: [
          { required: true, message: '请输入专业类别', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        rating: [
          { required: true, message: '请输入推荐评分', trigger: 'blur' },
          { type: 'number', min: 0, max: 5, message: '评分范围在 0 到 5 分', trigger: 'blur' }
        ],
        recommendationCount: [
          { required: true, message: '请输入推荐人次', trigger: 'blur' },
          { type: 'number', min: 0, message: '推荐人次必须大于等于0', trigger: 'blur' }
        ]
      },

      // 删除对话框
      deleteDialogVisible: false,
      deleteItem: {}
    }
  },

  computed: {
    // 编辑对话框标题
    editDialogTitle() {
      return this.editForm.id ? '编辑推荐记录' : '添加推荐记录'
    }
  },

  created() {
    // 获取当前高校管理员的大学ID
    this.universityId = this.$store.getters.universityId || 1
    console.log('当前大学ID:', this.universityId)
    this.fetchData()
  },

  methods: {
    // 跳转到指定页面
    jumpToPage() {
      if (!this.jumpPage) return
      const page = parseInt(this.jumpPage)
      if (isNaN(page) || page < 1 || page > Math.ceil(this.total / this.pageSize)) {
        return
      }
      this.currentPage = page
      this.jumpPage = ''
    },

    // 获取数据
    async fetchData() {
      try {
        this.loading = true
        await this.fetchRecommendationData()
      } catch (error) {
        console.error('获取专业推荐列表失败:', error)
        this.$message.error('获取数据失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },

    // 获取专业推荐数据
    async fetchRecommendationData() {
      try {
        console.log('获取专业推荐数据, universityId:', this.universityId)

        // 优先尝试使用新的专门API
        let response
        try {
          response = await getUniversityRecommendations(this.universityId)
          console.log('使用专门API获取数据成功')
        } catch (error) {
          console.log('专门API调用失败，回退使用通用API', error)
          // 如果新API失败，回退到旧API
          response = await getMajorRecommendations(this.universityId)
        }

        console.log('专业推荐API返回数据:', response)

        if (response && response.data) {
          // 处理数据 - API返回的结构可能是 {counts: [], index: []}
          let recommendationData = []

          // 检查API返回的数据格式
          if (response.data.index && Array.isArray(response.data.index)) {
            // 使用index数据，它包含评分信息
            recommendationData = response.data.index.map(item => ({
              id: item.id,
              universityId: this.universityId,
              majorCategory: item.name || item.majorCategory,
              rating: parseFloat(item.rating) || 0,
              recommendationCount: item.count || item.recommendationCount || 0
            }))
          } else if (Array.isArray(response.data)) {
            // 如果直接是数组
            recommendationData = response.data.map(item => ({
              id: item.id,
              universityId: this.universityId,
              majorCategory: item.name || item.majorCategory,
              rating: parseFloat(item.rating) || 0,
              recommendationCount: item.count || item.recommendationCount || 0
            }))
          }

          this.recommendationList = recommendationData
          this.total = recommendationData.length

          // 应用搜索过滤
          this.applyFilters()
        } else {
          this.$message.warning('未获取到专业推荐数据')
          this.recommendationList = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取专业推荐数据失败:', error)
        this.$message.error('获取数据失败: ' + (error.message || '未知错误'))
        this.recommendationList = []
        this.total = 0
      }
    },

    // 应用搜索过滤
    applyFilters() {
      let filtered = [...this.recommendationList]

      // 按专业类别搜索
      if (this.searchForm.majorCategory) {
        const keyword = this.searchForm.majorCategory.toLowerCase()
        filtered = filtered.filter(item =>
          (item.majorCategory || '').toLowerCase().includes(keyword)
        )
      }

      // 按评分范围搜索
      if (this.searchForm.ratingRange) {
        const range = this.searchForm.ratingRange
        if (range === '4+') {
          filtered = filtered.filter(item => item.rating >= 4)
        } else if (range === '3-4') {
          filtered = filtered.filter(item => item.rating >= 3 && item.rating < 4)
        } else if (range === '-3') {
          filtered = filtered.filter(item => item.rating < 3)
        }
      }

      // 更新过滤后的数据
      this.recommendationList = filtered
      this.total = filtered.length
    },

    // 搜索处理
    handleSearch() {
      this.currentPage = 1
      this.applyFilters()
    },

    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.fetchData()
    },

    // 添加记录
    handleAdd() {
      this.editForm = {
        id: null,
        universityId: this.universityId,
        majorCategory: '',
        rating: 0,
        recommendationCount: 0
      }
      this.editDialogVisible = true
    },

    // 编辑记录
    handleEdit(row) {
      this.editForm = {
        id: row.id,
        universityId: row.universityId || this.universityId,
        majorCategory: row.majorCategory,
        rating: parseFloat(row.rating) || 0,
        recommendationCount: row.recommendationCount || 0
      }
      this.editDialogVisible = true
    },

    // 删除记录
    handleDelete(row) {
      this.deleteItem = row
      this.deleteDialogVisible = true
    },

    // 确认删除
    async confirmDelete() {
      try {
        console.log('删除专业推荐记录:', this.deleteItem.id)

        // 调用API删除
        await deleteRecommendationRating(this.deleteItem.id)

        this.$message.success('删除成功')
        this.deleteDialogVisible = false

        // 刷新数据
        this.fetchData()
      } catch (error) {
        console.error('删除专业推荐记录失败:', error)
        this.$message.error('删除失败: ' + (error.message || '未知错误'))
      }
    },

    // 提交编辑表单
    submitEditForm() {
      this.$refs.editForm.validate(async (valid) => {
        if (valid) {
          try {
            // 构建提交数据
            const data = {
              id: this.editForm.id,
              universityId: this.editForm.universityId,
              name: this.editForm.majorCategory, // 使用后端API期望的字段名
              rating: this.editForm.rating,
              count: this.editForm.recommendationCount // 使用后端API期望的字段名
            }

            console.log('保存专业推荐数据:', data)

            // 优先使用新的专门API
            try {
              await updateUniversityRecommendation(this.universityId, data)
              console.log('使用专门API保存成功')
            } catch (error) {
              console.log('专门API调用失败，回退使用通用API', error)
              // 如果专门API失败，回退到通用API
              await saveRecommendationRating({
                id: data.id,
                universityId: data.universityId,
                majorCategory: data.name,
                rating: data.rating,
                recommendationCount: data.count
              })
            }

            this.$message.success(this.editForm.id ? '更新成功' : '添加成功')
            this.editDialogVisible = false

            // 刷新数据
            this.fetchData()
          } catch (error) {
            console.error('保存专业推荐记录失败:', error)
            this.$message.error('保存失败: ' + (error.message || '未知错误'))
          }
        } else {
          return false
        }
      })
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },

    // 页码变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    }
  }
}
</script>

<style lang="scss" scoped>
.recommendation-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
    }
  }

  .search-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 4px;

    .search-item {
      display: flex;
      align-items: center;
      margin-right: 20px;

      label {
        margin-right: 10px;
        font-size: 14px;
      }

      .el-input, .el-select {
        width: 200px;
      }
    }

    .search-actions {
      display: flex;

      .el-button {
        margin-left: 10px;

        &:first-child {
          margin-left: 0;
        }
      }
    }
  }

  .table-container {
    margin-bottom: 20px;
  }

  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;

    .total-info {
      font-size: 14px;
      color: #606266;
    }

    .page-info {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #606266;

      .jump-page {
        width: 50px;
        margin: 0 5px;
      }
    }
  }

  .rating-value {
    font-weight: bold;
    font-size: 16px;
    color: #409EFF;
  }
}
</style>
