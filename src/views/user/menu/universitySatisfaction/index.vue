<template>
  <div class="satisfaction-page">
    <!-- Banner Section -->
    <div class="banner">
      <div class="banner-content">
        <h1 class="banner-title">院校满意度</h1>
        <div class="stats-container">
          <span class="stats-text">当前累计投票人数</span>
          <span class="stats-number">578 万</span>
          <el-tag type="warning" size="medium" class="student-tag">本校学生实名投票</el-tag>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Search and filter section -->
      <div class="search-section">
        <el-input placeholder="请输入院校名称" v-model="searchForm.name" class="search-input" clearable @keyup.enter.native="handleSearch"></el-input>
        <el-button type="success" icon="el-icon-search" @click="handleSearch">搜索</el-button>

        <div class="filter-section">
          <div class="filter-label">筛选：</div>
          <el-select v-model="searchForm.location" placeholder="院校所在地" class="filter-select" clearable @change="handleFilter">
            <el-option v-for="item in locationOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>

          <el-select v-model="searchForm.department" placeholder="主管部门类别" class="filter-select" clearable @change="handleFilter">
            <el-option label="教育部" value="教育部"></el-option>
            <el-option label="省市自治区" value="省市自治区"></el-option>
          </el-select>

          <el-select v-model="searchForm.level" placeholder="办学层次" class="filter-select" clearable @change="handleFilter">
            <el-option label="本科" value="本科"></el-option>
            <el-option label="专科" value="专科"></el-option>
          </el-select>

          <el-select v-model="searchForm.feature" placeholder="院校特性" class="filter-select" clearable @change="handleFilter">
            <el-option label="985工程" value="985工程"></el-option>
            <el-option label="211工程" value="211工程"></el-option>
            <el-option label="双一流" value="双一流"></el-option>
          </el-select>
        </div>
      </div>

      <!-- Results table -->
      <div class="results-section">
        <el-table :data="tableData" border style="width: 100%" :fit="true" v-loading="loading">
          <el-table-column prop="name" label="院校名称" min-width="180"></el-table-column>
          <el-table-column prop="location" label="院校所在地" min-width="120"></el-table-column>
          <el-table-column label="综合满意度" min-width="180">
            <template slot-scope="scope">
              <div class="rating-info">
                <span class="rating-value orange">{{ scope.row.overallRating || 'N/A' }}</span>
                <span class="rating-count" v-if="scope.row.overallCount">({{ scope.row.overallCount }}人)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="环境满意度" min-width="180">
            <template slot-scope="scope">
              <div class="rating-info">
                <span class="rating-value orange">{{ scope.row.environmentRating || 'N/A' }}</span>
                <span class="rating-count" v-if="scope.row.environmentCount">({{ scope.row.environmentCount }}人)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="生活满意度" min-width="180">
            <template slot-scope="scope">
              <div class="rating-info">
                <span class="rating-value orange">{{ scope.row.lifeRating || 'N/A' }}</span>
                <span class="rating-count" v-if="scope.row.lifeCount">({{ scope.row.lifeCount }}人)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="详情" min-width="80" align="center">
            <template slot-scope="scope">
              <span class="check-link" @click="viewDetail(scope.row)">查看</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[5, 10, 20, 50]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUniversitySatisfactionList } from '@/api/universitySatisfaction'

export default {
  name: 'UniversitySatisfaction',
  data() {
    return {
      // 查询表单
      searchForm: {
        name: '',
        location: '',
        department: '',
        level: '',
        feature: ''
      },

      // 分页参数
      currentPage: 1,
      pageSize: 10,
      total: 0,

      // 表格数据
      tableData: [],

      // 加载状态
      loading: false,

      // 地区选项，可以从后端获取，这里简化处理
      locationOptions: ['北京市', '上海市', '广东省', '江苏省', '浙江省', '湖北省', '四川省']
    }
  },
  methods: {
    // 搜索处理
    handleSearch() {
      this.currentPage = 1
      this.fetchData()
    },

    // 筛选处理
    handleFilter() {
      this.currentPage = 1
      this.fetchData()
    },

    // 查看详情
    viewDetail(university) {
      this.$router.push(`/user/university/${university.id}/satisfaction`)
    },

    // 分页大小变化
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchData()
    },

    // 当前页变化
    handleCurrentChange(page) {
      this.currentPage = page
      this.fetchData()
    },

    // 获取数据
    fetchData() {
      this.loading = true

      // 构建查询参数
      const params = {
        page: this.currentPage,
        limit: this.pageSize,
        ...this.searchForm
      }

      getUniversitySatisfactionList(params)
        .then(response => {
          if (response.code === 200) {
            const { records, total } = response.data
            this.tableData = records || []
            this.total = total || 0
          } else {
            this.$message.error(response.message || '获取数据失败')
          }
        })
        .catch(error => {
          console.error('获取院校满意度列表失败:', error)
          this.$message.error('获取数据失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 重置表单
    resetForm() {
      this.searchForm = {
        name: '',
        location: '',
        department: '',
        level: '',
        feature: ''
      }
      this.currentPage = 1
      this.fetchData()
    }
  },
  created() {
    this.fetchData()
  }
}
</script>

<style lang="scss" scoped>
.satisfaction-page {
  min-height: 100vh;
  background-color: #f5f7fa;

  .banner {
    background-color: #3ebd93;
    padding: 36px 0;
    color: white;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }

    .banner-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;
      position: relative;
      z-index: 2;

      .banner-title {
        font-size: 42px;
        font-weight: bold;
        margin-bottom: 16px;
      }

      .stats-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;

        .stats-text {
          font-size: 16px;
        }

        .stats-number {
          font-size: 24px;
          font-weight: bold;
        }

        .student-tag {
          margin-left: 10px;
        }
      }
    }
  }

  .main-content {
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 20px;

    .search-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;

      .search-input {
        width: 300px;
      }

      .filter-section {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        margin-left: 20px;

        .filter-label {
          color: #666;
          font-size: 14px;
        }

        .filter-select {
          width: 160px;
        }
      }
    }

    .results-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 24px;

      .rating-info {
        display: flex;
        align-items: center;

        .rating-value {
          font-weight: bold;
          font-size: 16px;

          &.orange {
            color: #ff9900;
          }
        }

        .rating-count {
          margin-left: 5px;
          color: #999;
          font-size: 14px;
        }
      }

      .check-link {
        color: #3ebd93;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          color: #2aa77d;
          text-decoration: underline;
        }
      }

      .pagination-container {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

// Element UI customization
::v-deep .el-table th {
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
}

::v-deep .el-button--success {
  background-color: #3ebd93;
  border-color: #3ebd93;

  &:hover, &:focus {
    background-color: #4fcba4;
    border-color: #4fcba4;
  }
}

::v-deep .el-table .cell {
  line-height: 23px;
}

::v-deep .el-table__row {
  font-size: 14px;
}
</style>
