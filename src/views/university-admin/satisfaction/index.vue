<!--src/views/university-admin/satisfaction/index.vue-->
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
        <div class="chart-container" ref="trendChart" style="height: 400px"></div>
      </div>

      <!-- 满意度评分分布 -->
      <div class="rating-distribution">
        <div class="section-title">评分分布</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="distribution-chart" ref="distributionChart" style="height: 300px"></div>
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
          <el-form :model="searchForm" :inline="true" ref="searchForm">
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
        <div ref="analysisChart" style="height: 400px; margin-bottom: 20px;"></div>

        <div class="analysis-text">
          <h3>数据分析结果</h3>
          <p>根据最近一年的满意度数据分析，我校满意度评价呈现以下特点：</p>
          <ol>
            <li><strong>整体满意度稳中有升</strong>：过去一年整体满意度从4.3分上升至4.5分，提升了4.7%。</li>
            <li><strong>学生参与度增加</strong>：评价人数较去年同期增长25%，表明学生参与积极性提高。</li>
            <li><strong>专业差异明显</strong>：理工类专业满意度相对较高，平均为4.7分；文科类专业平均为4.3分。</li>
            <li><strong>改进空间</strong>：宿舍条件和食堂服务满意度相对较低，是未来需要改进的重点。</li>
          </ol>
        </div>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      :title="`${detailData.category} 满意度详情`"
      :visible.sync="detailDialogVisible"
      width="70%"
    >
      <div v-if="detailData.category" class="detail-content">
        <!-- 详情内容 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="专业类别">{{ detailData.category }}</el-descriptions-item>
          <el-descriptions-item label="平均评分">{{ detailData.rating }}分</el-descriptions-item>
          <el-descriptions-item label="评价人数">{{ detailData.ratingCount }}人</el-descriptions-item>
          <el-descriptions-item label="最近更新">{{ detailData.lastUpdateTime }}</el-descriptions-item>
          <el-descriptions-item label="月度变化">
            <span :class="detailData.monthlyChange > 0 ? 'trend-up' : 'trend-down'">
              {{ detailData.monthlyChange > 0 ? '+' : '' }}{{ detailData.monthlyChange }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="评分分布">
            <el-progress
              v-for="(rate, index) in detailData.ratingBreakdown"
              :key="index"
              :percentage="rate.percentage"
              :color="getRatingColor(rate.stars)"
              :format="() => `${rate.stars}星: ${rate.percentage}%`"
              style="margin-bottom: 10px;"
            />
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-chart" ref="detailChart" style="height: 300px; margin: 20px 0;"></div>

        <div class="detail-comments">
          <h4>学生评价摘要</h4>
          <el-divider></el-divider>
          <div v-for="(comment, index) in detailData.comments" :key="index" class="comment-item">
            <div class="comment-header">
              <span class="comment-rating">
                <el-rate v-model="comment.rating" disabled size="small"></el-rate>
              </span>
              <span class="comment-date">{{ comment.date }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'UniversitySatisfactionManagement',

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

      // 图表实例
      charts: {
        trendChart: null,
        distributionChart: null,
        analysisChart: null,
        detailChart: null
      },

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
      analysisDialogVisible: false,
      detailDialogVisible: false,
      detailData: {}
    }
  },

  mounted() {
    this.initCharts()
    this.fetchData()
  },

  beforeDestroy() {
    // 销毁图表实例
    Object.values(this.charts).forEach(chart => {
      chart && chart.dispose()
    })
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    initCharts() {
      // 初始化图表
      this.$nextTick(() => {
        this.charts.trendChart = echarts.init(this.$refs.trendChart)
        this.charts.distributionChart = echarts.init(this.$refs.distributionChart)

        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize)
      })
    },

    handleResize() {
      // 调整图表大小
      Object.values(this.charts).forEach(chart => {
        chart && chart.resize()
      })
    },

    async fetchData() {
      try {
        this.loading = true
        await Promise.all([
          this.fetchOverviewData(),
          this.fetchSatisfactionList()
        ])

        // 渲染图表
        this.renderTrendChart()
        this.renderDistributionChart()
      } catch (error) {
        console.error('获取满意度数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchOverviewData() {
      // 模拟获取概览数据
      await new Promise(resolve => setTimeout(resolve, 500))

      // 保持使用已有的模拟数据
    },

    async fetchSatisfactionList() {
      // 模拟获取满意度列表
      await new Promise(resolve => setTimeout(resolve, 500))

      // 模拟数据
      this.satisfactionList = [
        {
          category: '计算机科学与技术',
          rating: 4.8,
          ratingCount: 520,
          monthlyChange: 1.2,
          lastUpdateTime: '2025-03-20 15:30:22'
        },
        {
          category: '数学',
          rating: 4.7,
          ratingCount: 380,
          monthlyChange: 0.5,
          lastUpdateTime: '2025-03-19 11:15:47'
        },
        {
          category: '物理学',
          rating: 4.6,
          ratingCount: 420,
          monthlyChange: -0.3,
          lastUpdateTime: '2025-03-18 14:22:36'
        },
        {
          category: '经济学',
          rating: 4.5,
          ratingCount: 610,
          monthlyChange: 0.8,
          lastUpdateTime: '2025-03-15 09:45:13'
        },
        {
          category: '法学',
          rating: 4.4,
          ratingCount: 430,
          monthlyChange: 1.5,
          lastUpdateTime: '2025-03-14 16:30:55'
        }
      ]

      this.total = 15
    },

    renderTrendChart() {
      if (!this.charts.trendChart) return

      // 模拟趋势数据
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const data = [4.2, 4.3, 4.25, 4.4, 4.35, 4.5, 4.55, 4.6, 4.5, 4.65, 4.7, 4.5]

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br/>满意度: {c}分'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: months
        },
        yAxis: {
          type: 'value',
          min: 3.5,
          max: 5,
          name: '满意度评分'
        },
        series: [{
          name: '满意度',
          type: 'line',
          data: data,
          smooth: true,
          lineStyle: {
            width: 3
          },
          itemStyle: {
            color: '#409EFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(64, 158, 255, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(64, 158, 255, 0.1)'
                }
              ]
            }
          }
        }]
      }

      this.charts.trendChart.setOption(option)
    },

    renderDistributionChart() {
      if (!this.charts.distributionChart) return

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 0,
          data: ['5星', '4星', '3星', '2星', '1星']
        },
        series: [
          {
            name: '评分分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.ratingDistribution[5], name: '5星', itemStyle: { color: '#67C23A' } },
              { value: this.ratingDistribution[4], name: '4星', itemStyle: { color: '#409EFF' } },
              { value: this.ratingDistribution[3], name: '3星', itemStyle: { color: '#909399' } },
              { value: this.ratingDistribution[2], name: '2星', itemStyle: { color: '#E6A23C' } },
              { value: this.ratingDistribution[1], name: '1星', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      }

      this.charts.distributionChart.setOption(option)
    },

    renderAnalysisChart() {
      if (!this.charts.analysisChart) {
        this.$nextTick(() => {
          this.charts.analysisChart = echarts.init(this.$refs.analysisChart)
        })
      }

      if (!this.charts.analysisChart) return

      // 模拟不同专业类别的满意度数据
      const categories = ['理工类', '文学类', '经管类', '医学类', '法学类', '艺术类']
      const data = {
        '教学质量': [4.6, 4.3, 4.5, 4.7, 4.4, 4.2],
        '师资水平': [4.8, 4.5, 4.6, 4.9, 4.7, 4.3],
        '课程设置': [4.5, 4.4, 4.7, 4.6, 4.5, 4.4],
        '学习环境': [4.7, 4.6, 4.6, 4.8, 4.5, 4.6],
        '就业指导': [4.3, 4.2, 4.8, 4.5, 4.6, 4.1]
      }

      const series = Object.keys(data).map(key => ({
        name: key,
        type: 'bar',
        data: data[key]
      }))

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: Object.keys(data)
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: categories
        },
        yAxis: {
          type: 'value',
          min: 3.5,
          max: 5
        },
        series: series
      }

      this.charts.analysisChart.setOption(option)
    },

    renderDetailChart() {
      if (!this.charts.detailChart) {
        this.$nextTick(() => {
          this.charts.detailChart = echarts.init(this.$refs.detailChart)
        })
      }

      if (!this.charts.detailChart) return

      // 模拟12个月的历史数据
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const data = []

      // 生成波动的历史数据，基于当前评分
      const baseRating = this.detailData.rating || 4.5
      for (let i = 0; i < 12; i++) {
        data.push((baseRating - 0.3 + Math.random() * 0.6).toFixed(1))
      }

      const option = {
        title: {
          text: '满意度历史趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: months
        },
        yAxis: {
          type: 'value',
          min: Math.floor(Math.min(...data.map(Number)) * 10) / 10 - 0.1,
          max: Math.ceil(Math.max(...data.map(Number)) * 10) / 10 + 0.1
        },
        series: [{
          data: data,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3
          },
          itemStyle: {
            color: '#409EFF'
          },
          markPoint: {
            data: [
              { type: 'max', name: '最高值' },
              { type: 'min', name: '最低值' }
            ]
          }
        }]
      }

      this.charts.detailChart.setOption(option)
    },

    getRatingColor(rating) {
      const colors = {
        1: '#F56C6C',
        2: '#E6A23C',
        3: '#909399',
        4: '#409EFF',
        5: '#67C23A'
      }
      return colors[rating] || '#909399'
    },

    handleTrendTimeRangeChange(value) {
      // 更新趋势图数据
      this.renderTrendChart()
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
      this.detailDialogVisible = true

      // 模拟详细数据
      this.detailData = {
        ...row,
        ratingBreakdown: [
          { stars: 5, percentage: 60 },
          { stars: 4, percentage: 30 },
          { stars: 3, percentage: 7 },
          { stars: 2, percentage: 2 },
          { stars: 1, percentage: 1 }
        ],
        comments: [
          { rating: 5, date: '2025-03-15', content: '教师水平高，课程内容丰富，学习氛围浓厚，非常满意。' },
          { rating: 4, date: '2025-03-10', content: '整体满意，但希望增加更多实践课程。' },
          { rating: 5, date: '2025-03-05', content: '老师们都很负责任，随时可以请教问题，获得很多帮助。' },
          { rating: 3, date: '2025-02-28', content: '课程安排有些紧张，希望能更合理规划。' },
          { rating: 5, date: '2025-02-20', content: '课程设置符合行业需求，很有前瞻性。' }
        ]
      }

      // 渲染详情图表
      this.$nextTick(() => {
        this.renderDetailChart()
      })
    },

    handleExportDetail(row) {
      this.$message.success(`已导出 ${row.category} 的满意度数据`)
    },

    handleExport() {
      this.$message.success('已导出全部满意度数据')
    },

    showAnalysisDialog() {
      this.analysisDialogVisible = true

      // 渲染分析图表
      this.$nextTick(() => {
        this.renderAnalysisChart()
      })
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

  .analysis-content {
    .analysis-text {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 4px;

      h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #409EFF;
      }

      p {
        margin-bottom: 10px;
      }

      ol {
        padding-left: 20px;

        li {
          margin-bottom: 10px;
        }
      }
    }
  }

  .detail-content {
    .detail-comments {
      margin-top: 20px;

      h4 {
        font-size: 16px;
        color: #409EFF;
      }

      .comment-item {
        margin-bottom: 15px;
        padding: 10px;
        background: #f9f9f9;
        border-radius: 4px;

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .comment-date {
            color: #909399;
            font-size: 12px;
          }
        }

        .comment-content {
          color: #606266;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
