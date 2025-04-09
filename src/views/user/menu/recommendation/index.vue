<template>
  <div class="recommendation-page">
    <!-- Banner Section -->
    <div class="banner">
      <div class="banner-content">
        <h1 class="banner-title">专业推荐</h1>
        <div class="stats-container">
          <span class="stats-text">当前累计投票数量</span>
          <span class="stats-number">633 万</span>
          <el-tag type="warning" size="medium" class="student-tag">本校学生实名投票</el-tag>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Featured recommendation card -->
      <div class="featured-card">
        <div class="university-info">
          <div class="university-name">清华大学</div>
          <div class="major-name">计算机科学与技术</div>
        </div>
        <div class="vertical-line"></div>
        <div class="rating-container">
          <div class="rating-title">推荐指数</div>
          <div class="rating-value">4.8</div>
          <div class="rating-stars">
            <span class="star full"></span>
            <span class="star full"></span>
            <span class="star full"></span>
            <span class="star full"></span>
            <span class="star full"></span>
          </div>
          <div class="rating-count">227人推荐</div>
        </div>
        <div class="rating-distribution">
          <div class="distribution-row">
            <div class="stars">5☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 90%"></div>
            </div>
            <div class="percentage">90%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">4☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 8%"></div>
            </div>
            <div class="percentage">8%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">3☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 2%"></div>
            </div>
            <div class="percentage">2%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">2☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="percentage">0%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">1☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 0%"></div>
            </div>
            <div class="percentage">0%</div>
          </div>
        </div>
        <div class="hot-label">
          <span>最新投票的专业</span>
        </div>
      </div>

      <!-- Search and filter section -->
      <div class="search-section">
        <div class="search-inputs">
          <el-input placeholder="请输入院校名称" v-model="searchUniversity" class="search-input"></el-input>
          <el-input placeholder="请输入专业名称" v-model="searchMajor" class="search-input"></el-input>
          <el-button type="success" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        </div>

        <div class="filter-section">
          <div class="filter-label">筛选：</div>
          <el-select v-model="filterLocation" placeholder="院校所在地" class="filter-select" clearable>
            <el-option label="北京市" value="北京市"></el-option>
            <el-option label="上海市" value="上海市"></el-option>
            <el-option label="广东省" value="广东省"></el-option>
          </el-select>

          <el-select v-model="filterCategory" placeholder="主管部门类别" class="filter-select" clearable>
            <el-option label="教育部" value="教育部"></el-option>
            <el-option label="省市自治区" value="省市自治区"></el-option>
          </el-select>

          <el-select v-model="filterLevel" placeholder="办学层次" class="filter-select" clearable>
            <el-option label="本科" value="本科"></el-option>
            <el-option label="专科" value="专科"></el-option>
          </el-select>

          <el-select v-model="filterType" placeholder="院校特性" class="filter-select" clearable>
            <el-option label="985" value="985"></el-option>
            <el-option label="211" value="211"></el-option>
            <el-option label="双一流" value="双一流"></el-option>
          </el-select>
        </div>
      </div>

      <!-- Results table -->
      <div class="results-section">
        <el-table :data="paginatedData" border style="width: 100%">
          <el-table-column prop="universityName" label="院校名称" width="200"></el-table-column>
          <el-table-column prop="level" label="学历层次" width="120"></el-table-column>
          <el-table-column label="专业名称" min-width="200">
            <template slot-scope="scope">
              <div v-for="(major, index) in scope.row.majors" :key="index" class="major-row">
                <span class="major-name">{{ major.name }}</span>
                <div class="major-rating">
                  <span class="rating-value">{{ major.rating }}</span>
                  <span class="rating-count">({{ major.count }}人)</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <el-link type="success" class="more-link" @click="viewMore(scope.row)">更多</el-link>
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
            :total="totalItems">
          </el-pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfessionalRecommendation',
  data() {
    return {
      searchUniversity: '',
      searchMajor: '',
      filterLocation: '',
      filterCategory: '',
      filterLevel: '',
      filterType: '',
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      recommendationData: [
        {
          id: 1,
          universityName: '北京大学',
          level: '本科',
          majors: [
            { name: '经济学类', rating: 4.6, count: 192 },
            { name: '计算机科学与技术', rating: 4.6, count: 143 },
            { name: '法学', rating: 4.7, count: 136 }
          ]
        },
        {
          id: 2,
          universityName: '中国人民大学',
          level: '本科',
          majors: [
            { name: '金融学', rating: 4.8, count: 281 },
            { name: '法学', rating: 4.7, count: 235 },
            { name: '经济学', rating: 4.7, count: 201 }
          ]
        },
        {
          id: 3,
          universityName: '清华大学',
          level: '本科',
          majors: [
            { name: '经济与金融', rating: 4.6, count: 262 },
            { name: '计算机科学与技术', rating: 4.8, count: 227 },
            { name: '数理基础科学', rating: 4.4, count: 121 }
          ]
        },
        {
          id: 4,
          universityName: '北京交通大学',
          level: '本科',
          majors: [
            { name: '通信工程', rating: 4.7, count: 654 },
            { name: '交通运输类', rating: 4.7, count: 530 },
            { name: '土木工程', rating: 4.6, count: 448 }
          ]
        },
        {
          id: 5,
          universityName: '北京交通大学',
          level: '高职(专科)',
          majors: [
            { name: '道路与桥梁工程技术', rating: 4.4, count: 61 },
            { name: '计算机应用技术', rating: 4.3, count: 56 },
            { name: '道路养护与管理', rating: 4.5, count: 41 }
          ]
        },
        {
          id: 6,
          universityName: '浙江大学',
          level: '本科',
          majors: [
            { name: '软件工程', rating: 4.9, count: 325 },
            { name: '电子信息工程', rating: 4.7, count: 278 },
            { name: '自动化', rating: 4.8, count: 255 }
          ]
        },
        {
          id: 7,
          universityName: '复旦大学',
          level: '本科',
          majors: [
            { name: '新闻学', rating: 4.8, count: 174 },
            { name: '临床医学', rating: 4.9, count: 315 },
            { name: '经济学', rating: 4.6, count: 267 }
          ]
        },
        {
          id: 8,
          universityName: '上海交通大学',
          level: '本科',
          majors: [
            { name: '机械工程', rating: 4.7, count: 218 },
            { name: '电气工程', rating: 4.8, count: 236 },
            { name: '船舶与海洋工程', rating: 4.6, count: 189 }
          ]
        },
        {
          id: 9,
          universityName: '南京大学',
          level: '本科',
          majors: [
            { name: '物理学', rating: 4.7, count: 154 },
            { name: '化学', rating: 4.6, count: 145 },
            { name: '天文学', rating: 4.8, count: 98 }
          ]
        },
        {
          id: 10,
          universityName: '武汉大学',
          level: '本科',
          majors: [
            { name: '测绘工程', rating: 4.9, count: 263 },
            { name: '水利工程', rating: 4.7, count: 187 },
            { name: '土木工程', rating: 4.5, count: 215 }
          ]
        },
        {
          id: 11,
          universityName: '四川大学',
          level: '本科',
          majors: [
            { name: '口腔医学', rating: 4.9, count: 198 },
            { name: '基础医学', rating: 4.7, count: 175 },
            { name: '药学', rating: 4.6, count: 187 }
          ]
        },
        {
          id: 12,
          universityName: '吉林大学',
          level: '本科',
          majors: [
            { name: '地质学', rating: 4.8, count: 156 },
            { name: '考古学', rating: 4.7, count: 128 },
            { name: '汽车工程', rating: 4.6, count: 213 }
          ]
        }
      ]
    }
  },
  computed: {
    // Filter data based on search criteria
    filteredData() {
      let result = this.recommendationData;

      // Filter by university name
      if (this.searchUniversity) {
        result = result.filter(item =>
          item.universityName.toLowerCase().includes(this.searchUniversity.toLowerCase())
        );
      }

      // Filter by major name
      if (this.searchMajor) {
        result = result.filter(item =>
          item.majors.some(major =>
            major.name.toLowerCase().includes(this.searchMajor.toLowerCase())
          )
        );
      }

      // Filter by location
      if (this.filterLocation) {
        // In a real app, you would have location data on your items
        // This is a placeholder for demonstration
        result = result.filter(item => item.location === this.filterLocation);
      }

      // Additional filters would be implemented here

      return result;
    },

    // Paginate the filtered data
    paginatedData() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.filteredData.slice(startIndex, endIndex);
    }
  },
  methods: {
    handleSearch() {
      console.log('Searching for universities and majors');
      this.currentPage = 1; // Reset to first page when searching
    },
    viewMore(row) {
      console.log('View more details for:', row.universityName);
      this.$router.push(`/user/university/${row.id}`);
    },
    handleSizeChange(size) {
      this.pageSize = size;
      console.log(`Page size changed to ${size}`);
    },
    handleCurrentChange(page) {
      this.currentPage = page;
      console.log(`Current page changed to ${page}`);
    },

    // This would be replaced with an actual API call in a real application
    fetchData() {
      // In a real app, this would be an API call
      // For demo purposes, we're just setting the total count based on filtered data
      this.totalItems = this.filteredData.length;
    }
  },
  watch: {
    // Watch for changes in filters to update data
    searchUniversity() {
      this.fetchData();
    },
    searchMajor() {
      this.fetchData();
    },
    filterLocation() {
      this.fetchData();
    },
    filterCategory() {
      this.fetchData();
    },
    filterLevel() {
      this.fetchData();
    },
    filterType() {
      this.fetchData();
    },

    // Watch for changes in filtered data to update total
    filteredData: {
      handler() {
        this.totalItems = this.filteredData.length;
      },
      immediate: true
    }
  },
  mounted() {
    this.fetchData();
  }
}
</script>

<style lang="scss" scoped>
.recommendation-page {
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

    .featured-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 24px;
      display: flex;
      position: relative;
      margin-bottom: 24px;
      overflow: hidden;

      .university-info {
        flex: 0 0 300px;
        padding-right: 24px;

        .university-name {
          font-size: 18px;
          color: #333;
          margin-bottom: 8px;
        }

        .major-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
      }

      .vertical-line {
        width: 1px;
        background-color: #e8e8e8;
        margin: 0 20px;
      }

      .rating-container {
        flex: 0 0 150px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .rating-title {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
        }

        .rating-value {
          font-size: 48px;
          font-weight: bold;
          color: #333;
        }

        .rating-stars {
          display: flex;
          margin: 8px 0;

          .star {
            width: 24px;
            height: 24px;
            margin: 0 2px;
            position: relative;

            &.full::before {
              content: "★";
              color: #f7ba2a;
              font-size: 24px;
            }

            &.half::before {
              content: "★";
              color: #f7ba2a;
              font-size: 24px;
              clip-path: inset(0 50% 0 0);
              position: absolute;
            }

            &.half::after {
              content: "☆";
              color: #f7ba2a;
              font-size: 24px;
              position: absolute;
              left: 0;
            }
          }
        }

        .rating-count {
          font-size: 14px;
          color: #999;
        }
      }

      .rating-distribution {
        flex: 1;
        padding: 0 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .distribution-row {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          height: 20px;

          .stars {
            flex: 0 0 30px;
            font-size: 12px;
            color: #666;
            text-align: right;
            margin-right: 10px;
          }

          .progress-container {
            flex: 1;
            height: 8px;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;

            .progress-bar {
              height: 100%;
              background-color: #f7ba2a;
            }
          }

          .percentage {
            flex: 0 0 40px;
            font-size: 12px;
            color: #666;
            margin-left: 10px;
          }
        }
      }

      .hot-label {
        position: absolute;
        top: -6px; /* 调整顶部位置，向下移动 */
        right: -58px; /* 调整右侧位置，向右移动 */
        background-color: #ff9900;
        color: white;
        padding: 35px 50px 8px 50px; /* 增加顶部内边距，将文字向下移动 */
        font-size: 12px; /* 减小文字大小 */
        transform: rotate(45deg);
        box-shadow: 0 2px 8px rgba(255, 153, 0, 0.3);
        text-align: center; /* 确保文本居中 */
        white-space: nowrap; /* 防止文本换行 */
        transform-origin: center; /* 确保旋转以中心为基点 */
      }
    }

    .search-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;

      .search-inputs {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        .search-input {
          flex: 1;
        }
      }

      .filter-section {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;

        .filter-label {
          color: #666;
          font-size: 14px;
        }

        .filter-select {
          width: 180px;
        }
      }
    }

    .results-section {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 24px;

      .major-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .major-name {
          font-size: 14px;
          color: #333;
        }

        .major-rating {
          .rating-value {
            font-weight: bold;
            color: #3ebd93;
          }

          .rating-count {
            font-size: 12px;
            color: #999;
            margin-left: 4px;
          }
        }
      }

      .more-link {
        color: #3ebd93;
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
</style>
