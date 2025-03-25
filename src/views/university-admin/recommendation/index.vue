<!--src/views/university-admin/recommendation/index.vue-->
<template>
  <div class="recommendation-management">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>专业推荐管理</span>
      </div>

      <!-- 数据概览 -->
      <el-row :gutter="20" class="data-overview">
        <el-col :span="8">
          <el-card shadow="hover" class="data-card">
            <div class="card-title">专业平均推荐分</div>
            <div class="card-value">{{ averageRating }}分</div>
            <div class="card-trend" :class="{ up: ratingTrend > 0, down: ratingTrend < 0 }">
              <i :class="ratingTrend > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
              {{ Math.abs(ratingTrend) }}%
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="data-card">
            <div class="card-title">推荐总人次</div>
            <div class="card-value">{{ totalRecommendations }}</div>
            <div class="card-desc">本月新增 {{ monthlyNewRecommendations }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="data-card">
            <div class="card-title">最高推荐专业</div>
            <div class="card-value">{{ topMajor }}</div>
            <div class="card-desc">{{ topMajorRating }}分，{{ topMajorCount }}人次</div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 推荐数据比较图 -->
      <div class="comparison-chart">
        <div class="section-title">
          <span>推荐对比</span>
          <div class="chart-controls">
            <el-radio-group v-model="comparisonType" size="small" @change="renderComparisonChart">
              <el-radio-button label="category">按专业类别</el-radio-button>
              <el-radio-button label="year">按年度</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="chart-container" ref="comparisonChart" style="height: 400px"></div>
      </div>

      <!-- 推荐管理列表 -->
      <div class="recommendation-list">
        <div class="section-title">
          <span>推荐记录</span>
          <div class="operation-group">
            <el-button type="primary" size="small" @click="handleExport">导出数据</el-button>
            <el-button type="primary" size="small" @click="showTrendDialog">趋势分析</el-button>
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
          :data="recommendationList"
          border
          style="width: 100%"
        >
          <el-table-column prop="majorCategory" label="专业类别" min-width="150" />
          <el-table-column label="推荐评分" width="150" align="center">
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
          <el-table-column prop="recommendationCount" label="推荐人次" width="100" align="center" sortable />
          <el-table-column label="年度对比" width="150" align="center">
            <template slot-scope="scope">
              <div class="comparison-cell">
                <span :class="getComparisonClass(scope.row.yearComparison)">
                  {{ scope.row.yearComparison > 0 ? '+' : '' }}{{ scope.row.yearComparison }}%
                </span>
                <el-tooltip effect="dark" :content="`去年同期: ${scope.row.lastYearCount}人次`" placement="top">
                  <i class="el-icon-info"></i>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="latestUpdateTime" label="最近更新" width="150" align="center" />
          <el-table-column label="排名趋势" width="120" align="center">
            <template slot-scope="scope">
              <div class="rank-trend">
                <span :class="getRankTrendClass(scope.row.rankTrend)">
                  <i :class="getRankTrendIcon(scope.row.rankTrend)"></i>
                  {{ Math.abs(scope.row.rankTrend) || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="handleViewDetail(scope.row)"
              >详情</el-button>
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

    <!-- 趋势分析对话框 -->
    <el-dialog
      title="专业推荐趋势分析"
      :visible.sync="trendDialogVisible"
      width="80%"
    >
      <div class="trend-analysis">
        <div class="tabs-container">
          <el-tabs v-model="activeTrendTab" @tab-click="handleTrendTabChange">
            <el-tab-pane label="年度趋势" name="year">
              <div ref="yearTrendChart" style="height: 400px; margin-bottom: 20px;"></div>
            </el-tab-pane>
            <el-tab-pane label="专业对比" name="category">
              <div ref="categoryTrendChart" style="height: 400px; margin-bottom: 20px;"></div>
            </el-tab-pane>
            <el-tab-pane label="推荐来源" name="source">
              <div ref="sourceTrendChart" style="height: 400px; margin-bottom: 20px;"></div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="trend-summary">
          <h3>趋势分析结果</h3>
          <div class="summary-content">
            <p>根据最近三年的推荐数据分析，我校专业推荐情况呈现以下特点：</p>
            <ol>
              <li><strong>整体推荐评分稳中有升</strong>：过去三年推荐评分从4.3分上升至4.6分，提升了7%。</li>
              <li><strong>理工类专业持续领先</strong>：计算机科学、电子信息等理工类专业推荐评分和人次始终处于前列。</li>
              <li><strong>文科类专业增长显著</strong>：近一年文科类专业推荐人次增长13.5%，成为增长最快的专业类别。</li>
              <li><strong>应届考生推荐占比上升</strong>：应届考生推荐占比从去年的65%上升到今年的72%，表明学校在新生群体中的吸引力提升。</li>
            </ol>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      :title="`${detailData.majorCategory} 推荐详情`"
      :visible.sync="detailDialogVisible"
      width="70%"
    >
      <div v-if="detailData.majorCategory" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="专业类别">{{ detailData.majorCategory }}</el-descriptions-item>
          <el-descriptions-item label="推荐评分">{{ detailData.rating }}分</el-descriptions-item>
          <el-descriptions-item label="推荐人次">{{ detailData.recommendationCount }}人次</el-descriptions-item>
          <el-descriptions-item label="最近更新">{{ detailData.latestUpdateTime }}</el-descriptions-item>
          <el-descriptions-item label="年度对比">
            <span :class="getComparisonClass(detailData.yearComparison)">
              {{ detailData.yearComparison > 0 ? '+' : '' }}{{ detailData.yearComparison }}%
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="历史排名趋势">
            <el-progress
              v-for="(rank, index) in detailData.historicalRanks"
              :key="index"
              :percentage="calculateRankPercentage(rank.rank)"
              :color="getRankColor(rank.rank)"
              :format="() => `${rank.year}年: 第${rank.rank}名`"
              style="margin-bottom: 8px;"
            />
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-chart" ref="detailTrendChart" style="height: 300px; margin: 20px 0;"></div>

        <div class="detail-recommendation-sources">
          <h4>推荐来源分析</h4>
          <el-divider></el-divider>
          <div ref="sourcePieChart" style="height: 300px;"></div>
        </div>

        <div class="detail-comments">
          <h4>推荐理由摘要</h4>
          <el-divider></el-divider>
          <div v-for="(comment, index) in detailData.comments" :key="index" class="comment-item">
            <div class="comment-header">
              <span class="comment-type">
                <el-tag size="small" :type="getCommentTypeTag(comment.type)">{{ comment.type }}</el-tag>
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
  name: 'UniversityRecommendationManagement',

  data() {
    return {
      loading: false,

      // 概览数据
      averageRating: 4.6,
      ratingTrend: 3.5,
      totalRecommendations: 3680,
      monthlyNewRecommendations: 215,
      topMajor: '计算机科学与技术',
      topMajorRating: 4.9,
      topMajorCount: 820,

      // 图表实例
      charts: {
        comparisonChart: null,
        yearTrendChart: null,
        categoryTrendChart: null,
        sourceTrendChart: null,
        detailTrendChart: null,
        sourcePieChart: null
      },

      // 比较类型
      comparisonType: 'category',

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
      recommendationList: [],

      // 分类选项
      categoryOptions: [
        { label: '理工类', value: 'science-engineering' },
        { label: '文学类', value: 'literature' },
        { label: '经管类', value: 'economics-management' },
        { label: '医学类', value: 'medicine' },
        { label: '法学类', value: 'law' },
        { label: '艺术类', value: 'art' }
      ],

      // 对话框
      trendDialogVisible: false,
      activeTrendTab: 'year',
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
      // 初始化比较图表
      this.$nextTick(() => {
        this.charts.comparisonChart = echarts.init(this.$refs.comparisonChart)

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
          this.fetchRecommendationList()
        ])

        // 渲染图表
        this.renderComparisonChart()
      } catch (error) {
        console.error('获取推荐数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchOverviewData() {
      // 模拟获取概览数据
      await new Promise(resolve => setTimeout(resolve, 500))

      // 使用模拟数据，已在data中定义
    },

    async fetchRecommendationList() {
      // 模拟获取推荐列表
      await new Promise(resolve => setTimeout(resolve, 500))

      // 模拟数据
      this.recommendationList = [
        {
          majorCategory: '计算机科学与技术',
          rating: 4.9,
          recommendationCount: 820,
          yearComparison: 15.3,
          lastYearCount: 712,
          latestUpdateTime: '2025-03-22 15:30:22',
          rankTrend: 0 // 排名不变
        },
        {
          majorCategory: '电子信息工程',
          rating: 4.7,
          recommendationCount: 620,
          yearComparison: 8.2,
          lastYearCount: 573,
          latestUpdateTime: '2025-03-21 14:25:10',
          rankTrend: 1 // 排名上升1位
        },
        {
          majorCategory: '金融学',
          rating: 4.6,
          recommendationCount: 580,
          yearComparison: 12.6,
          lastYearCount: 515,
          latestUpdateTime: '2025-03-20 09:45:36',
          rankTrend: 3 // 排名上升3位
        },
        {
          majorCategory: '通信工程',
          rating: 4.5,
          recommendationCount: 465,
          yearComparison: -2.1,
          lastYearCount: 475,
          latestUpdateTime: '2025-03-19 16:12:58',
          rankTrend: -2 // 排名下降2位
        },
        {
          majorCategory: '人工智能',
          rating: 4.8,
          recommendationCount: 690,
          yearComparison: 25.7,
          lastYearCount: 549,
          latestUpdateTime: '2025-03-18 11:30:45',
          rankTrend: 2 // 排名上升2位
        }
      ]

      this.total = 15
    },

    renderComparisonChart() {
      if (!this.charts.comparisonChart) return

      let option

      if (this.comparisonType === 'category') {
        // 按专业类别比较
        const categories = this.recommendationList.map(item => item.majorCategory)
        const ratings = this.recommendationList.map(item => item.rating)
        const counts = this.recommendationList.map(item => item.recommendationCount)

        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['推荐评分', '推荐人次']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: categories,
              axisLabel: {
                interval: 0,
                rotate: 30
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '推荐评分',
              min: 4,
              max: 5,
              interval: 0.2,
              position: 'left'
            },
            {
              type: 'value',
              name: '推荐人次',
              position: 'right'
            }
          ],
          series: [
            {
              name: '推荐评分',
              type: 'bar',
              data: ratings,
              yAxisIndex: 0,
              itemStyle: {
                color: '#409EFF'
              }
            },
            {
              name: '推荐人次',
              type: 'line',
              yAxisIndex: 1,
              data: counts,
              symbol: 'circle',
              symbolSize: 8,
              lineStyle: {
                width: 3
              },
              itemStyle: {
                color: '#67C23A'
              }
            }
          ]
        }
      } else {
        // 按年度比较
        option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['总推荐人次', '平均推荐评分']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: ['2020年', '2021年', '2022年', '2023年', '2024年', '2025年']
            }
          ],
          yAxis: [
            {
              type: 'value',
              name: '推荐人次',
              position: 'left'
            },
            {
              type: 'value',
              name: '推荐评分',
              min: 4,
              max: 5,
              interval: 0.2,
              position: 'right'
            }
          ],
          series: [
            {
              name: '总推荐人次',
              type: 'bar',
              data: [1580, 1850, 2320, 2680, 3150, 3680],
              yAxisIndex: 0,
              itemStyle: {
                color: '#409EFF'
              }
            },
            {
              name: '平均推荐评分',
              type: 'line',
              yAxisIndex: 1,
              data: [4.3, 4.35, 4.4, 4.5, 4.55, 4.6],
              symbol: 'circle',
              symbolSize: 8,
              lineStyle: {
                width: 3
              },
              itemStyle: {
                color: '#67C23A'
              }
            }
          ]
        }
      }

      this.charts.comparisonChart.setOption(option, { notMerge: true })
    },

    renderYearTrendChart() {
      if (!this.charts.yearTrendChart) {
        this.$nextTick(() => {
          this.charts.yearTrendChart = echarts.init(this.$refs.yearTrendChart)
        })
      }

      if (!this.charts.yearTrendChart) return

      const option = {
        title: {
          text: '年度推荐趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['理工类', '文学类', '经管类', '医学类', '法学类', '艺术类'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['2020年', '2021年', '2022年', '2023年', '2024年', '2025年']
        },
        yAxis: {
          type: 'value',
          name: '推荐人次'
        },
        series: [
          {
            name: '理工类',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [820, 950, 1250, 1380, 1560, 1880]
          },
          {
            name: '文学类',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [250, 320, 380, 420, 490, 560]
          },
          {
            name: '经管类',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [320, 350, 410, 480, 580, 650]
          },
          {
            name: '医学类',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [90, 120, 160, 210, 290, 340]
          },
          {
            name: '法学类',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [50, 60, 70, 110, 170, 180]
          },
          {
            name: '艺术类',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            data: [50, 50, 50, 80, 60, 70]
          }
        ]
      }

      this.charts.yearTrendChart.setOption(option)
    },

    renderCategoryTrendChart() {
      if (!this.charts.categoryTrendChart) {
        this.$nextTick(() => {
          this.charts.categoryTrendChart = echarts.init(this.$refs.categoryTrendChart)
        })
      }

      if (!this.charts.categoryTrendChart) return

      const option = {
        title: {
          text: '专业类别推荐对比',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['2023年', '2024年', '2025年'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          name: '推荐人次'
        },
        yAxis: {
          type: 'category',
          data: ['理工类', '文学类', '经管类', '医学类', '法学类', '艺术类']
        },
        series: [
          {
            name: '2023年',
            type: 'bar',
            data: [1380, 420, 480, 210, 110, 80]
          },
          {
            name: '2024年',
            type: 'bar',
            data: [1560, 490, 580, 290, 170, 60]
          },
          {
            name: '2025年',
            type: 'bar',
            data: [1880, 560, 650, 340, 180, 70]
          }
        ]
      }

      this.charts.categoryTrendChart.setOption(option)
    },

    renderSourceTrendChart() {
      if (!this.charts.sourceTrendChart) {
        this.$nextTick(() => {
          this.charts.sourceTrendChart = echarts.init(this.$refs.sourceTrendChart)
        })
      }

      if (!this.charts.sourceTrendChart) return

      const option = {
        title: {
          text: '推荐来源分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          top: 30,
          data: ['应届考生', '在校学生', '校友', '家长', '教师']
        },
        series: [
          {
            name: '推荐来源',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 2650, name: '应届考生' },
              { value: 520, name: '在校学生' },
              { value: 280, name: '校友' },
              { value: 180, name: '家长' },
              { value: 50, name: '教师' }
            ],
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              formatter: '{b}: {c} ({d}%)'
            }
          }
        ]
      }

      this.charts.sourceTrendChart.setOption(option)
    },

    renderDetailCharts() {
      // 渲染详情页的趋势图
      this.$nextTick(() => {
        if (!this.charts.detailTrendChart) {
          this.charts.detailTrendChart = echarts.init(this.$refs.detailTrendChart)
        }

        if (!this.charts.sourcePieChart) {
          this.charts.sourcePieChart = echarts.init(this.$refs.sourcePieChart)
        }

        this.renderDetailTrendChart()
        this.renderSourcePieChart()
      })
    },

    renderDetailTrendChart() {
      if (!this.charts.detailTrendChart) return

      // 模拟历史数据
      const years = ['2020年', '2021年', '2022年', '2023年', '2024年', '2025年']
      const ratings = [4.3, 4.4, 4.5, 4.6, 4.7, 4.8]
      const counts = [320, 380, 450, 520, 580, 650]

      const option = {
        title: {
          text: '历年推荐趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['推荐评分', '推荐人次'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: years
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '推荐评分',
            min: 4,
            max: 5,
            interval: 0.2,
            position: 'left'
          },
          {
            type: 'value',
            name: '推荐人次',
            position: 'right'
          }
        ],
        series: [
          {
            name: '推荐评分',
            type: 'line',
            data: ratings,
            yAxisIndex: 0,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 3
            },
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '推荐人次',
            type: 'bar',
            yAxisIndex: 1,
            data: counts,
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      }

      this.charts.detailTrendChart.setOption(option)
    },

    renderSourcePieChart() {
      if (!this.charts.sourcePieChart) return

      const option = {
        title: {
          text: '推荐来源分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'horizontal',
          bottom: 10,
          data: ['应届考生', '在校学生', '校友', '家长', '教师']
        },
        series: [
          {
            name: '推荐来源',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
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
              { value: 380, name: '应届考生', itemStyle: { color: '#409EFF' } },
              { value: 120, name: '在校学生', itemStyle: { color: '#67C23A' } },
              { value: 80, name: '校友', itemStyle: { color: '#E6A23C' } },
              { value: 50, name: '家长', itemStyle: { color: '#F56C6C' } },
              { value: 20, name: '教师', itemStyle: { color: '#909399' } }
            ]
          }
        ]
      }

      this.charts.sourcePieChart.setOption(option)
    },

    // 处理趋势对话框标签切换
    handleTrendTabChange(tab) {
      this.activeTrendTab = tab.name

      switch (tab.name) {
        case 'year':
          this.renderYearTrendChart()
          break
        case 'category':
          this.renderCategoryTrendChart()
          break
        case 'source':
          this.renderSourceTrendChart()
          break
      }
    },

    // 计算排名百分比（用于进度条）
    calculateRankPercentage(rank) {
      // 排名越高，百分比越大
      const maxRank = 20 // 假设最多显示20名
      return Math.max(0, Math.min(100, (maxRank - rank + 1) / maxRank * 100))
    },

    // 获取排名颜色
    getRankColor(rank) {
      if (rank <= 3) return '#67C23A' // 前三名，绿色
      if (rank <= 10) return '#409EFF' // 前十名，蓝色
      return '#909399' // 其他，灰色
    },

    // 获取评论类型标签样式
    getCommentTypeTag(type) {
      const typeMap = {
        '就业前景': 'success',
        '教学质量': 'primary',
        '师资力量': 'info',
        '校园环境': 'warning',
        '学习氛围': ''
      }
      return typeMap[type] || ''
    },

    // 获取对比样式
    getComparisonClass(value) {
      return {
        'trend-up': value > 0,
        'trend-down': value < 0,
        'trend-flat': value === 0
      }
    },

    // 获取排名趋势样式
    getRankTrendClass(value) {
      return {
        'rank-up': value > 0,
        'rank-down': value < 0,
        'rank-flat': value === 0
      }
    },

    // 获取排名趋势图标
    getRankTrendIcon(value) {
      if (value > 0) return 'el-icon-top'
      if (value < 0) return 'el-icon-bottom'
      return 'el-icon-minus'
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchRecommendationList()
    },

    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.handleSearch()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchRecommendationList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchRecommendationList()
    },

    handleExportDetail(row) {
      this.$message.success(`已导出 ${row.majorCategory} 的推荐数据`)
    },

    handleExport() {
      this.$message.success('已导出全部推荐数据')
    },

    showTrendDialog() {
      this.trendDialogVisible = true
      this.activeTrendTab = 'year'

      // 渲染趋势图表
      this.$nextTick(() => {
        this.renderYearTrendChart()
      })
    },

    handleViewDetail(row) {
      this.detailDialogVisible = true

      // 模拟详细数据
      this.detailData = {
        ...row,
        historicalRanks: [
          { year: 2020, rank: 8 },
          { year: 2021, rank: 6 },
          { year: 2022, rank: 5 },
          { year: 2023, rank: 4 },
          { year: 2024, rank: 3 },
          { year: 2025, rank: 2 }
        ],
        comments: [
          { type: '就业前景', date: '2025-03-15', content: '该专业就业前景非常好，毕业生大多能进入知名互联网公司和研究机构，薪资水平高。' },
          { type: '教学质量', date: '2025-03-10', content: '教学内容紧跟行业发展，实践机会多，培养了很强的专业能力。' },
          { type: '师资力量', date: '2025-03-05', content: '教授们都是业内知名专家，教学经验丰富，能给学生很多指导。' },
          { type: '校园环境', date: '2025-02-28', content: '实验室设施先进，学习环境优越，资源丰富。' },
          { type: '学习氛围', date: '2025-02-20', content: '同学们学习热情高，氛围好，经常有学术交流活动。' }
        ]
      }

      // 渲染详情图表
      this.$nextTick(() => {
        this.renderDetailCharts()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.recommendation-management {
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

    .chart-controls,
    .operation-group {
      .el-button {
        margin-left: 10px;
      }
    }
  }

  .comparison-chart {
    margin-bottom: 30px;
  }

  .recommendation-list {
    .search-bar {
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
    }

    .comparison-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;

      .el-icon-info {
        color: #909399;
        cursor: help;
      }
    }

    .trend-up {
      color: #67C23A;
    }

    .trend-down {
      color: #F56C6C;
    }

    .trend-flat {
      color: #909399;
    }

    .rank-trend {
      .rank-up {
        color: #67C23A;
      }

      .rank-down {
        color: #F56C6C;
      }

      .rank-flat {
        color: #909399;
      }
    }
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }

  .trend-analysis {
    .trend-summary {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 4px;
      margin-top: 20px;

      h3 {
        margin-top: 0;
        margin-bottom: 15px;
        color: #409EFF;
      }

      .summary-content {
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
