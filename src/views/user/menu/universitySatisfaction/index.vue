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
          <el-table-column prop="name" label="院校名称" width="180"></el-table-column>
          <el-table-column prop="location" label="院校所在地" width="120"></el-table-column>
          <el-table-column label="综合满意度" width="180">
            <template slot-scope="scope">
              <div class="rating-info">
                <span class="rating-value orange">{{ scope.row.overallRating }}</span>
                <span class="rating-count">({{ scope.row.overallCount }}人)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="环境满意度" width="180">
            <template slot-scope="scope">
              <div class="rating-info">
                <span class="rating-value orange">{{ scope.row.environmentRating }}</span>
                <span class="rating-count">({{ scope.row.environmentCount }}人)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="生活满意度" width="180">
            <template slot-scope="scope">
              <div class="rating-info">
                <span class="rating-value orange">{{ scope.row.lifeRating }}</span>
                <span class="rating-count">({{ scope.row.lifeCount }}人)</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="详情" width="120" fixed="right">
            <template slot-scope="scope">
              <el-link type="success" class="check-link" @click="viewDetail(scope.row)">查看</el-link>
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
  name: 'UniversitySatisfaction',
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
      universityData: [
        {
          id: 1,
          name: '北京大学',
          location: '北京',
          overallRating: 4.6,
          overallCount: 1803,
          environmentRating: 4.5,
          environmentCount: 2011,
          lifeRating: 4.3,
          lifeCount: 1773
        },
        {
          id: 2,
          name: '中国人民大学',
          location: '北京',
          overallRating: 4.6,
          overallCount: 1154,
          environmentRating: 4.3,
          environmentCount: 1321,
          lifeRating: 4.1,
          lifeCount: 1139
        },
        {
          id: 3,
          name: '清华大学',
          location: '北京',
          overallRating: 4.7,
          overallCount: 1807,
          environmentRating: 4.7,
          environmentCount: 1960,
          lifeRating: 4.7,
          lifeCount: 1778
        },
        {
          id: 4,
          name: '北京交通大学',
          location: '北京',
          overallRating: 4.4,
          overallCount: 3581,
          environmentRating: 4.3,
          environmentCount: 3836,
          lifeRating: 4.0,
          lifeCount: 3482
        },
        {
          id: 5,
          name: '北京工业大学',
          location: '北京',
          overallRating: 4.3,
          overallCount: 1132,
          environmentRating: 4.4,
          environmentCount: 1330,
          lifeRating: 4.1,
          lifeCount: 1105
        },
        {
          id: 6,
          name: '北京航空航天大学',
          location: '北京',
          overallRating: 4.3,
          overallCount: 1599,
          environmentRating: 4.3,
          environmentCount: 1909,
          lifeRating: 4.0,
          lifeCount: 1577
        },
        {
          id: 7,
          name: '北京理工大学',
          location: '北京',
          overallRating: 4.4,
          overallCount: 2218,
          environmentRating: 4.4,
          environmentCount: 2473,
          lifeRating: 4.2,
          lifeCount: 2146
        },
        {
          id: 8,
          name: '北京科技大学',
          location: '北京',
          overallRating: 4.5,
          overallCount: 2525,
          environmentRating: 4.4,
          environmentCount: 2738,
          lifeRating: 4.4,
          lifeCount: 2437
        },
        {
          id: 9,
          name: '上海交通大学',
          location: '上海',
          overallRating: 4.7,
          overallCount: 1905,
          environmentRating: 4.6,
          environmentCount: 2103,
          lifeRating: 4.5,
          lifeCount: 1888
        },
        {
          id: 10,
          name: '复旦大学',
          location: '上海',
          overallRating: 4.8,
          overallCount: 1732,
          environmentRating: 4.7,
          environmentCount: 1892,
          lifeRating: 4.6,
          lifeCount: 1765
        },
        {
          id: 11,
          name: '同济大学',
          location: '上海',
          overallRating: 4.5,
          overallCount: 1630,
          environmentRating: 4.4,
          environmentCount: 1752,
          lifeRating: 4.3,
          lifeCount: 1687
        },
        {
          id: 12,
          name: '华东师范大学',
          location: '上海',
          overallRating: 4.4,
          overallCount: 1521,
          environmentRating: 4.3,
          environmentCount: 1645,
          lifeRating: 4.5,
          lifeCount: 1587
        },
        {
          id: 13,
          name: '武汉大学',
          location: '湖北',
          overallRating: 4.6,
          overallCount: 1843,
          environmentRating: 4.8,
          environmentCount: 1973,
          lifeRating: 4.4,
          lifeCount: 1812
        },
        {
          id: 14,
          name: '华中科技大学',
          location: '湖北',
          overallRating: 4.5,
          overallCount: 1736,
          environmentRating: 4.4,
          environmentCount: 1832,
          lifeRating: 4.3,
          lifeCount: 1765
        },
        {
          id: 15,
          name: '南京大学',
          location: '江苏',
          overallRating: 4.7,
          overallCount: 1678,
          environmentRating: 4.6,
          environmentCount: 1823,
          lifeRating: 4.5,
          lifeCount: 1732
        }
      ]
    }
  },
  computed: {
    // Filter data based on search criteria
    filteredData() {
      let result = this.universityData;

      // Filter by name
      if (this.searchKeyword) {
        result = result.filter(item =>
          item.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
      }

      // Filter by location
      if (this.filterLocation) {
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
      console.log('Searching for universities');
      this.currentPage = 1; // Reset to first page when searching
    },
    viewDetail(university) {
      console.log('View details for:', university.name);
      this.$router.push(`/user/university/${university.id}/satisfaction`);
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
