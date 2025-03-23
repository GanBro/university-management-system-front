<template>
  <div class="satisfaction-page">
    <!-- Banner Section -->
    <div class="banner">
      <div class="banner-content">
        <h1 class="banner-title">专业满意度</h1>
        <div class="stats-container">
          <span class="stats-text">当前累计投票人数</span>
          <span class="stats-number">840 万</span>
          <el-tag type="warning" size="medium" class="student-tag">本校学生实名投票</el-tag>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Featured Major Card -->
      <div class="featured-card">
        <div class="major-info">
          <div class="university-name">山东大学</div>
          <div class="major-name">新闻学</div>
        </div>
        <div class="vertical-line"></div>
        <div class="rating-container">
          <div class="rating-title">满意度指数</div>
          <div class="rating-value">3.6</div>
          <div class="rating-stars">
            <span class="star full"></span>
            <span class="star full"></span>
            <span class="star full"></span>
            <span class="star half"></span>
            <span class="star empty"></span>
          </div>
          <div class="rating-count">145人推荐</div>
        </div>
        <div class="rating-distribution">
          <div class="distribution-row">
            <div class="stars">5☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 33%"></div>
            </div>
            <div class="percentage">33%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">4☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 22%"></div>
            </div>
            <div class="percentage">22%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">3☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 28%"></div>
            </div>
            <div class="percentage">28%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">2☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 9%"></div>
            </div>
            <div class="percentage">9%</div>
          </div>
          <div class="distribution-row">
            <div class="stars">1☆</div>
            <div class="progress-container">
              <div class="progress-bar" style="width: 8%"></div>
            </div>
            <div class="percentage">8%</div>
          </div>
        </div>
        <div class="hot-label">
          <span>最新评分专业</span>
        </div>
      </div>

      <!-- Search and filter section -->
      <div class="search-section">
        <el-input placeholder="请输入院校名称" v-model="searchKeyword" class="search-input"></el-input>
        <el-button type="success" icon="el-icon-search" @click="handleSearch">搜索</el-button>

        <div class="filter-section">
          <div class="filter-label">筛选：</div>
          <el-select v-model="filterLocation" placeholder="院校所在地" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="北京" value="北京"></el-option>
            <el-option label="上海" value="上海"></el-option>
            <el-option label="广东" value="广东"></el-option>
          </el-select>

          <el-select v-model="filterDepartment" placeholder="主管部门类别" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="教育部" value="教育部"></el-option>
            <el-option label="省市自治区" value="省市自治区"></el-option>
          </el-select>

          <el-select v-model="filterLevel" placeholder="办学层次" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="本科" value="本科"></el-option>
            <el-option label="专科" value="专科"></el-option>
          </el-select>

          <el-select v-model="filterType" placeholder="院校特性" class="filter-select">
            <el-option label="全部" value=""></el-option>
            <el-option label="985" value="985"></el-option>
            <el-option label="211" value="211"></el-option>
            <el-option label="双一流" value="双一流"></el-option>
          </el-select>
        </div>
      </div>

      <!-- Results table -->
      <div class="results-section">
        <el-table :data="paginatedData" border style="width: 100%">
          <el-table-column prop="universityName" label="院校名称" width="180"></el-table-column>
          <el-table-column prop="level" label="学历层次" width="120"></el-table-column>
          <el-table-column label="专业名称" min-width="200">
            <template slot-scope="scope">
              <div class="major-list">
                <div class="major-item" v-for="(major, index) in scope.row.majors" :key="index">
                  <div class="major-name">{{ major.name }}</div>
                  <div class="major-rating">
                    <span class="rating-value" :class="{'orange-rating': major.rating >= 4.5, 'yellow-rating': major.rating < 4.5 && major.rating >= 4.0, 'normal-rating': major.rating < 4.0}">{{ major.rating.toFixed(1) }}</span>
                    <span class="rating-count">({{ major.count }}人)</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="详情" width="120" fixed="right">
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
  name: 'MajorSatisfaction',
  data() {
    return {
      searchKeyword: '',
      filterLocation: '',
      filterDepartment: '',
      filterLevel: '',
      filterType: '',
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      majorData: [
        {
          id: 1,
          universityName: '北京大学',
          level: '本科',
          majors: [
            { name: '微电子科学与工程', rating: 5.0, count: 12 },
            { name: '统计学', rating: 4.8, count: 12 },
            { name: '广播电视编导', rating: 4.8, count: 11 }
          ]
        },
        {
          id: 2,
          universityName: '中国人民大学',
          level: '本科',
          majors: [
            { name: '市场营销', rating: 5.0, count: 10 },
            { name: '统计学', rating: 4.9, count: 18 },
            { name: '会计学', rating: 4.8, count: 38 }
          ]
        },
        {
          id: 3,
          universityName: '清华大学',
          level: '本科',
          majors: [
            { name: '心理学', rating: 4.8, count: 23 },
            { name: '计算机软件', rating: 4.8, count: 10 },
            { name: '软件工程', rating: 4.8, count: 12 }
          ]
        },
        {
          id: 4,
          universityName: '北京交通大学',
          level: '本科',
          majors: [
            { name: '车辆工程', rating: 4.7, count: 56 },
            { name: '计算机科学与技术', rating: 4.5, count: 239 },
            { name: '财务管理', rating: 4.5, count: 39 }
          ]
        },
        {
          id: 5,
          universityName: '北京交通大学',
          level: '高职(专科)',
          majors: [
            { name: '道路桥梁工程技术', rating: 3.9, count: 86 },
            { name: '法律事务', rating: 3.9, count: 19 },
            { name: '旅游英语', rating: 3.6, count: 12 }
          ]
        },
        {
          id: 6,
          universityName: '浙江大学',
          level: '本科',
          majors: [
            { name: '光电信息科学与工程', rating: 4.9, count: 45 },
            { name: '材料科学与工程', rating: 4.7, count: 56 },
            { name: '机械设计制造及其自动化', rating: 4.8, count: 77 }
          ]
        },
        {
          id: 7,
          universityName: '复旦大学',
          level: '本科',
          majors: [
            { name: '中国语言文学类', rating: 4.8, count: 98 },
            { name: '新闻传播学类', rating: 4.9, count: 87 },
            { name: '临床医学', rating: 4.7, count: 123 }
          ]
        },
        {
          id: 8,
          universityName: '南京大学',
          level: '本科',
          majors: [
            { name: '哲学', rating: 4.6, count: 45 },
            { name: '天文学', rating: 4.9, count: 34 },
            { name: '大气科学', rating: 4.7, count: 29 }
          ]
        },
        {
          id: 9,
          universityName: '山东大学',
          level: '本科',
          majors: [
            { name: '新闻学', rating: 3.6, count: 145 },
            { name: '历史学', rating: 4.2, count: 98 },
            { name: '法学', rating: 4.5, count: 134 }
          ]
        },
        {
          id: 10,
          universityName: '武汉大学',
          level: '本科',
          majors: [
            { name: '测绘工程', rating: 4.9, count: 87 },
            { name: '遥感科学与技术', rating: 4.8, count: 76 },
            { name: '电子信息工程', rating: 4.7, count: 112 }
          ]
        },
        {
          id: 11,
          universityName: '四川大学',
          level: '本科',
          majors: [
            { name: '口腔医学', rating: 5.0, count: 78 },
            { name: '临床医学', rating: 4.8, count: 145 },
            { name: '法学', rating: 4.6, count: 123 }
          ]
        },
        {
          id: 12,
          universityName: '中山大学',
          level: '本科',
          majors: [
            { name: '中山医学院', rating: 4.9, count: 98 },
            { name: '管理学院', rating: 4.7, count: 87 },
            { name: '国际商学院', rating: 4.6, count: 76 }
          ]
        },
        {
          id: 13,
          universityName: '南开大学',
          level: '本科',
          majors: [
            { name: '金融学', rating: 4.8, count: 123 },
            { name: '经济学', rating: 4.7, count: 134 },
            { name: '国际经济与贸易', rating: 4.6, count: 98 }
          ]
        },
        {
          id: 14,
          universityName: '同济大学',
          level: '本科',
          majors: [
            { name: '建筑学', rating: 5.0, count: 76 },
            { name: '土木工程', rating: 4.8, count: 134 },
            { name: '城市规划', rating: 4.9, count: 87 }
          ]
        },
        {
          id: 15,
          universityName: '华东师范大学',
          level: '本科',
          majors: [
            { name: '教育学', rating: 4.8, count: 98 },
            { name: '心理学', rating: 4.9, count: 76 },
            { name: '地理科学', rating: 4.7, count: 85 }
          ]
        }
      ]
    }
  },
  computed: {
    // Filter data based on search criteria
    filteredData() {
      let result = this.majorData;

      // Filter by university name
      if (this.searchKeyword) {
        result = result.filter(item =>
          item.universityName.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          item.majors.some(major =>
            major.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
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
      console.log('Searching for majors');
      this.currentPage = 1; // Reset to first page when searching
    },
    viewMore(university) {
      console.log('View more details for:', university.universityName);
      this.$router.push(`/user/university/${university.id}/major-satisfaction`);
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
    searchKeyword() {
      this.fetchData();
    },
    filterLocation() {
      this.fetchData();
    },
    filterDepartment() {
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

    .featured-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      padding: 24px;
      display: flex;
      position: relative;
      margin-bottom: 24px;
      overflow: hidden;

      .major-info {
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

            &.empty::before {
              content: "☆";
              color: #f7ba2a;
              font-size: 24px;
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
        top: -12px;
        right: -50px;
        background-color: #ff9900;
        color: white;
        padding: 30px 40px 5px 40px;
        font-size: 14px;
        transform: rotate(45deg);
        box-shadow: 0 2px 8px rgba(255, 153, 0, 0.3);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%);
        }
      }
    }

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

      .major-list {
        .major-item {
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
            display: flex;
            align-items: center;

            .rating-value {
              font-weight: bold;
              font-size: 16px;

              &.orange-rating {
                color: #ff9900;
              }

              &.yellow-rating {
                color: #e5ba2a;
              }

              &.normal-rating {
                color: #888;
              }
            }

            .rating-count {
              margin-left: 4px;
              font-size: 12px;
              color: #999;
            }
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
