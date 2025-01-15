<!--# src/views/admin/university/satisfaction/index.vue-->
<template>
  <div class="satisfaction-management">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>满意度管理</span>
      </div>

      <!-- 数据概览 -->
      <el-row :gutter="20" class="data-overview">
        <el-col :span="8">
          <el-card shadow="hover" class="data-card">
            <div class="card-title">综合满意度</div>
            <div class="card-value">{{ overallSatisfaction }}分</div>
            <div class="card-trend" :class="{ up: satisfactionTrend > 0, down: satisfactionTrend < 0 }">
              <i :class="satisfactionTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
              {{ Math.abs(satisfactionTrend) }}%
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="data-card">
            <div class="card-title">评价总数</div>
            <div class="card-value">{{ totalRatings }}</div>
            <div class="card-desc">本月新增 {{ monthlyNewRatings }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="data-card">
            <div class="card-title">参评率</div>
            <div class="card-value">{{ participationRate }}%</div>
            <div class="card-desc">较上月 {{ participationTrend }}%</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 满意度趋势图 -->
      <div class="trend-chart">
        <div class="section-title">满意度趋势</div>
        <div class="chart-filters">
          <el-radio-group v-model="trendTimeRange" size="small" @change="handleTrendTimeRangeChange">
            <el-radio-button label="week">最近一周</el-radio-button>
            <el-radio-button label="month">最近一月</el-radio-button>
            <el-radio-button label="quarter">最近一季</el-radio-button>
            <el-radio-button label="year">最近一年</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-container" style="height: 400px">
          <!-- 这里使用 echarts 绘制趋势图 -->
        </div>
      </div>

      <!-- 满意度评分分布 -->
      <div class="rating-distribution">
        <div class="section-title">评分分布</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="distribution-chart">
              <!-- 环形图展示评分分布 -->
            </div>
          </el-col>
          <el-col :span="12">
            <div class="distribution-list">
              <div v-for="(value, star) in ratingDistribution" :key="star" class="distribution-item">
                <span class="star-label">{{ star }}星</span>
                <el-progress
                  :percentage="value"
                  :color="getRatingColor(parseInt(star))"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 满意度管理列表 -->
      <div class="satisfaction-list">
        <div class="section-title">
          <span>满意度记录</span>
          <div class="operation-group">
            <el-button type="primary" size="small" @click="handleExport">导出数据</el-button>
            <el-button type="primary" size="small" @click="showAnalysisDialog">数据分析</el-button>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-form :model="searchForm" :inline="true">
            <el-form-item label="专业类别">
              <el-select v-model="searchForm.category" placeholder="请选择" clearable>
                <el-option
                  v-for="item in categoryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="评分范围">
              <el-select v-model="searchForm.ratingRange" placeholder="请选择" clearable>
                <el-option label="4分以上" value="4+" />
                <el-option label="3-4分" value="3-4" />
                <el-option label="3分以下" value="-3" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="searchForm.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 数据表格 -->
        <el-table
          :data="satisfactionList"
          border
          style="width: 100%"
        >
          <el-table-column prop="category" label="专业类别" min-width="180" />
          <el-table-column label="满意度评分" width="180">
            <template slot-scope="scope">
              <el-rate
                v-model="scope.row.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          <el-table-column prop="ratingCount" label="评价人数" width="120" sortable />
          <el-table-column label="月度变化" width="120">
            <template slot-scope="scope">
              <span :class="{
                'trend-up': scope.row.monthlyChange > 0,
                'trend-down': scope.row.monthlyChange < 0
              }">
                {{ scope.row.monthlyChange > 0 ? '+' : '' }}{{ scope.row.monthlyChange }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdateTime" label="最近更新" width="180" />
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="handleViewDetail(scope.row)"
              >查看详情</el-button>
              <el-button
                type="text"
                size="small"
                @click="handleExportDetail(scope.row)"
              >导出</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          />
        </div>
      </div>
    </el-card>

    <!-- 数据分析对话框 -->
    <el-dialog
      title="满意度数据分析"
      :visible.sync="analysisDialogVisible"
      width="80%"
    >
      <div class="analysis-content">
        <!-- 分析图表和内容 -->
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'SatisfactionManagement',

  data() {
    return {
      loading: false,
      // 概览数据
      overallSatisfaction: 4.5,
      satisfactionTrend: 2.3,
      totalRatings: 1250,
      monthlyNewRatings: 156,
      participationRate: 85,
      participationTrend: 5,

      // 趋势图配置
      trendTimeRange: 'month',

      // 评分分布
      ratingDistribution: {
        5: 45,
        4: 35,
        3: 15,
        2: 4,
        1: 1
      },

      // 搜索表单
      searchForm: {
        category: '',
        ratingRange: '',
        timeRange: []
      },

      // 表格数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      satisfactionList: [],

      // 分类选项
      categoryOptions: [
        { label: '理工类', value: 'science' },
        { label: '文学类', value: 'liberal-arts' },
        { label: '经管类', value: 'economics' },
        { label: '医学类', value: 'medicine' }
      ],

      // 对话框
      analysisDialogVisible: false
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        await Promise.all([
          this.fetchOverviewData(),
          this.fetchSatisfactionList()
        ])
      } catch (error) {
        console.error('获取满意度数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchOverviewData() {
      // TODO: 实现获取概览数据的接口
    },

    async fetchSatisfactionList() {
      // TODO: 实现获取满意度列表的接口
    },

    getRatingColor(rating) {
      const colors = {
        1: '#F56C6C',
        2: '#E6A23C',
        3: '#67C23A',
        4: '#409EFF',
        5: '#10b981'
      }
      return colors[rating] || '#909399'
    },

    handleTrendTimeRangeChange(value) {
      // 更新趋势图数据
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchSatisfactionList()
    },

    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.handleSearch()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchSatisfactionList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchSatisfactionList()
    },

    handleViewDetail(row) {
      // 查看详情
    },

    handleExportDetail(row) {
      // 导出单个专业的详细数据
    },

    handleExport() {
      // 导出所有数据
    },

    showAnalysisDialog() {
      this.analysisDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.satisfaction-management {
  padding: 20px;

  .data-overview {
    margin-bottom: 30px;

    .data-card {
      .card-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
      }

      .card-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 10px;
      }

      .card-trend {
        font-size: 14px;

        &.up {
          color: #67C23A;
        }

        &.down {
          color: #F56C6C;
        }

        i {
          margin-right: 4px;
        }
      }

      .card-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .operation-group {
      .el-button {
        margin-left: 10px;
      }
    }
  }

  .trend-chart {
    margin-bottom: 30px;

    .chart-filters {
      margin-bottom: 15px;
      text-align: right;
    }
  }

  .rating-distribution {
    margin-bottom: 30px;

    .distribution-list {
      .distribution-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        .star-label {
          width: 50px;
          margin-right: 10px;
          text-align: right;
        }

        .el-progress {
          flex: 1;
        }
      }
    }
  }

  .satisfaction-list {
    .search-bar {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
    }

    .trend-up {
      color: #67C23A;
    }

    .trend-down {
      color: #F56C6C;
    }
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
