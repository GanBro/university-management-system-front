<!--src/views/admin/dashboard/index.vue-->
<!--todo 周月季年没反应-->
<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span class="card-title">{{ card.title }}</span>
            <el-tooltip :content="card.tooltip" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="card-body">
            <div class="card-value">{{ card.value }}</div>
            <div v-if="card.trend" class="card-trend">
              <span :class="getTrendClass(card.trend)">
                <i :class="getTrendIcon(card.trend)"></i>
                {{ formatTrend(card.trend) }}
              </span>
              <span class="trend-label">{{ card.trendLabel }}</span>
            </div>
            <div v-if="card.subValue" class="sub-value">
              <span :class="card.subValueType">{{ card.subValue }}</span>
            </div>
            <div v-if="card.metric" class="card-metric">
              <el-progress
                :percentage="card.metric"
                :color="getProgressColor"
                :format="percentageFormat"
              ></el-progress>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高校分布地图 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover">
          <div class="map-header">
            <span>高校分布地图</span>
            <div class="map-controls">
              <el-button
                size="small"
                type="text"
                @click="toggleProvinceLabels"
                class="label-toggle"
              >
                <i :class="showProvinceLabels ? 'el-icon-view' : 'el-icon-hide'"></i>
                {{ showProvinceLabels ? '隐藏省份' : '显示省份' }}
              </el-button>
              <el-radio-group v-model="mapViewType" size="small">
                <el-radio-button label="category">分类视图</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div id="university-map" style="height: 500px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据趋势图表 -->
    <el-row :gutter="20" class="trend-section">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="chart-header">
            <span>增长趋势</span>
            <el-date-picker
              v-model="dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
              size="small"
              value-format="yyyy-MM"
              :picker-options="{
                shortcuts: [
                  {
                    text: '最近三个月',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(start.getMonth() - 2);
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '最近半年',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(start.getMonth() - 5);
                      picker.$emit('pick', [start, end]);
                    }
                  },
                  {
                    text: '最近一年',
                    onClick(picker) {
                      const end = new Date();
                      const start = new Date();
                      start.setMonth(start.getMonth() - 11);
                      picker.$emit('pick', [start, end]);
                    }
                  }
                ],
                disabledDate(time) {
                  return time.getTime() > Date.now();
                },
                firstDayOfWeek: 1,
                onPick: ({ maxDate, minDate }) => {
                  const startDate = minDate;
                  if (startDate && !maxDate) {
                    this.$nextTick(() => {
                      // 防止自动联动
                      this.dateRange = [startDate, null];
                    });
                  }
                }
              }"
              :clearable="true"
              @change="handleDateRangeChange"
            ></el-date-picker>
          </div>
          <div id="growth-trend-chart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="rank-card">
          <div slot="header">
            <span>活跃用户排行</span>
          </div>
          <div class="rank-list">
            <div v-for="(user, index) in activeUserRanking" :key="index" class="rank-item">
              <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
              <span class="user-name">{{ user.userName }}</span>
              <span class="user-score">{{ user.actionCount }}次</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户行为分析 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header">用户行为分析</div>
          <div class="behavior-stats">
            <el-row :gutter="20">
              <el-col :span="8" v-for="(behavior, index) in behaviorStats" :key="index">
                <div class="behavior-item">
                  <div class="behavior-icon">
                    <i :class="behavior.icon"></i>
                  </div>
                  <div class="behavior-info">
                    <div class="behavior-value">{{ behavior.value }}</div>
                    <div class="behavior-label">{{ behavior.label }}</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import * as echarts from 'echarts'
import chinaJson from '@/assets/geojson/china.json'

export default {
  name: 'Dashboard',

  data() {
    return {
      loading: false,
      mapViewType: 'category',
      dateRange: [],
      showProvinceLabels: false,
      charts: {
        mapChart: null,
        trendChart: null
      }
    }
  },

  computed: {
    ...mapState('dashboard', [
      'stats',
      'activeUserRanking',
      'systemStatus'
    ]),

    statCards() {
      return [
        {
          title: '总高校数量',
          tooltip: '系统中所有高校的总数',
          value: this.stats.totalUniversityCount,
          trend: this.stats.recentUniversityCount,
          trendLabel: '较上月'
        },
        {
          title: '活跃用户',
          tooltip: '过去7天的活跃用户数量',
          value: this.stats.activeUserCount,
          trend: this.stats.monthlyActiveUserCount - this.stats.activeUserCount,
          trendLabel: '较上周'
        },
        {
          title: '咨询总数',
          tooltip: '用户发起的咨询总数',
          value: this.stats.totalInteractionCount,
          subValue: `待处理: ${this.stats.pendingInteractionCount}`,
          subValueType: 'pending'
        },
        {
          title: '平均响应时间',
          tooltip: '互动响应的平均处理时间',
          value: this.formatDuration(this.stats.avgResponseTime),
          metric: this.stats.responseRate
        }
      ]
    },
    behaviorStats() {
      return [
        {
          icon: 'el-icon-chat-dot-square',
          value: this.stats.totalInteractionCount,  // 直接使用总咨询数
          label: '咨询总数'
        },
        {
          icon: 'el-icon-message',
          value: this.stats.userBehaviorStats?.replyCount || 0,
          label: '回复数'
        },
        {
          icon: 'el-icon-star-on',
          value: this.stats.userBehaviorStats?.followCount || 0,
          label: '关注数'
        }
      ]
    },

    getProgressColor() {
      return (percentage) => {
        if (percentage < 60) return '#F56C6C'
        if (percentage < 80) return '#E6A23C'
        return '#67C23A'
      }
    }
  },

  watch: {
    mapViewType: {
      handler() {
        if (this.charts.mapChart) {
          this.$nextTick(() => {
            this.renderMap()
          })
        }
      }
    },
    dateRange: {
      handler(newRange) {
        if (newRange && newRange.length === 2) {
          this.handleDateRangeChange(newRange)
        }
      }
    },
    'stats.universityDistribution': {
      handler(newVal) {
        if (newVal?.length > 0) {
          this.renderMap()
        }
      }
    },
    'stats.growthTrend': {
      handler(newVal) {
        if (newVal?.length > 0) {
          this.renderTrendChart()
        }
      }
    },
    showProvinceLabels: {
      handler() {
        if (this.charts.mapChart) {
          this.renderMap()
        }
      }
    }
  },

  mounted() {
    this.initCharts()
    this.loadDashboardData()
  },

  beforeDestroy() {
    this.disposeCharts()
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    ...mapActions('dashboard', [
      'fetchDashboardData',
      'fetchDataByDateRange'
    ]),

    toggleProvinceLabels() {
      this.showProvinceLabels = !this.showProvinceLabels
    },

    async loadDashboardData() {
      try {
        this.loading = true
        await this.fetchDashboardData()
        this.$nextTick(() => {
          this.renderCharts()
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        this.$message.error('数据加载失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    initCharts() {
      this.charts.mapChart = echarts.init(document.getElementById('university-map'))
      this.charts.trendChart = echarts.init(document.getElementById('growth-trend-chart'))

      window.addEventListener('resize', this.handleResize)
    },

    handleResize() {
      Object.values(this.charts).forEach(chart => {
        chart?.resize()
      })
    },

    disposeCharts() {
      Object.values(this.charts).forEach(chart => {
        chart?.dispose()
      })
    },

    renderCharts() {
      this.renderMap()
      this.renderTrendChart()
    },

    renderMap() {
      if (!this.charts.mapChart || !this.stats.universityDistribution?.length) return

      echarts.registerMap('china', chinaJson)

      const getMapOption = () => {
        const baseOption = {
          tooltip: {
            trigger: 'item',
            formatter: ({ name, value }) => {
              const count = Array.isArray(value) ? value[2] : value
              return `${name}<br/>高校数量：${count || 0}所`
            }
          },
          geo: {
            map: 'china',
            roam: true,
            label: {
              show: this.showProvinceLabels,
              color: '#333'
            },
            itemStyle: {
              areaColor: '#e9ecef',
              borderColor: '#999'
            },
            emphasis: {
              label: {
                show: true
              },
              itemStyle: {
                areaColor: '#b8c6db'
              }
            }
          }
        }

        const max = Math.max(...this.stats.universityDistribution.map(item => item.count))
        return {
          ...baseOption,
          visualMap: {
            min: 0,
            max,
            left: 'left',
            top: 'bottom',
            text: ['高', '低'],
            calculable: true,
            inRange: {
              color: ['#ffcdd2', '#b71c1c']
            }
          },
          series: [{
            name: '高校分布',
            type: 'map',
            geoIndex: 0,
            data: this.stats.universityDistribution.map(item => ({
              name: item.province,
              value: item.count
            }))
          }]
        }
      }

      this.charts.mapChart.setOption(getMapOption(), {
        notMerge: true,
        transition: ['color', 'itemStyle'],
        duration: 1000
      })
    },

    renderTrendChart() {
      if (!this.charts.trendChart || !this.stats.growthTrend?.length) return

      // 过滤选定日期范围内的数据
      let trendData = this.stats.growthTrend
      if (this.dateRange && this.dateRange.length === 2) {
        const [startDate, endDate] = this.dateRange
        trendData = this.stats.growthTrend.filter(item => {
          return item.date >= startDate && item.date <= endDate
        })
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: function(params) {
            const data = params[0]
            return `${data.name}<br/>高校数量：${data.value}所`
          }
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
          data: trendData.map(item => item.date)
        },
        yAxis: {
          type: 'value',
          name: '高校数量',
          nameTextStyle: {
            padding: [0, 30, 0, 0]
          }
        },
        series: [{
          name: '高校数量',
          type: 'line',
          smooth: true,
          data: trendData.map(item => item.value),
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }

      this.charts.trendChart.setOption(option)
    },

    formatDuration(minutes) {
      if (!minutes) return '0分钟'
      if (minutes < 60) return `${minutes}分钟`
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}小时${remainingMinutes}分钟`
    },

    formatTrend(value) {
      if (!value) return '0%'
      return value > 0 ? `+${value}%` : `${value}%`
    },

    getTrendClass(value) {
      return {
        'trend-up': value > 0,
        'trend-down': value < 0,
        'trend-flat': value === 0
      }
    },

    getTrendIcon(value) {
      if (value > 0) return 'el-icon-top'
      if (value < 0) return 'el-icon-bottom'
      return 'el-icon-minus'
    },

    getRankClass(index) {
      const classes = ['rank-1', 'rank-2', 'rank-3']
      return index < 3 ? classes[index] : ''
    },

    percentageFormat(percentage) {
      return `${percentage}%`
    },

    handleDateRangeChange(range) {
      if (!range || range.length !== 2) return
      
      this.loading = true
      const [startDate, endDate] = range
      
      this.fetchDataByDateRange({ startDate, endDate })
        .then(() => {
          this.$nextTick(() => {
            this.renderCharts()
          })
        })
        .catch(error => {
          console.error('Failed to fetch data by date range:', error)
          this.$message.error('获取数据失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    fetchDataByDateRange() {
      if (!this.dateRange || this.dateRange.length !== 2) return
      
      const [startDate, endDate] = this.dateRange
      this.loading = true
      
      return this.$store.dispatch('dashboard/fetchDataByDateRange', { startDate, endDate })
        .then(() => {
          this.$nextTick(() => {
            this.renderCharts()
          })
        })
        .catch(error => {
          console.error('Failed to fetch data by date range:', error)
          this.$message.error('获取数据失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .dashboard-cards {
    margin-bottom: 20px;

    .data-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .card-title {
          font-size: 14px;
          color: #606266;
        }

        .el-icon-info {
          color: #909399;
          cursor: help;
          transition: color 0.3s ease;

          &:hover {
            color: #409EFF;
          }
        }
      }

      .card-body {
        .card-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 10px;
        }

        .card-trend {
          font-size: 13px;
          display: flex;
          align-items: center;

          .trend-up {
            color: #67C23A;
          }

          .trend-down {
            color: #F56C6C;
          }

          .trend-flat {
            color: #909399;
          }

          .trend-label {
            margin-left: 5px;
            color: #909399;
          }
        }

        .sub-value {
          font-size: 13px;
          color: #909399;
          margin-top: 8px;

          .pending {
            color: #E6A23C;
            font-weight: 500;
          }
        }

        .card-metric {
          margin-top: 15px;
        }
      }
    }
  }

  .map-header,
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #EBEEF5;

    .map-controls {
      display: flex;
      align-items: center;
      gap: 16px;

      .label-toggle {
        display: flex;
        align-items: center;
        gap: 4px;

        i {
          margin-right: 4px;
        }
      }

      .el-radio-group {
        margin-left: 15px;
      }
    }
  }

  .trend-section {
    margin: 20px 0;

    .rank-card {
      .rank-list {
        padding: 0 15px;

        .rank-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #EBEEF5;
          transition: all 0.3s ease;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            background-color: #f5f7fa;
            padding-left: 8px;
          }

          .rank-number {
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border-radius: 50%;
            margin-right: 12px;
            font-size: 12px;
            color: #909399;
            font-weight: bold;

            &.rank-1 {
              background: #F56C6C;
              color: white;
              box-shadow: 0 2px 4px rgba(245,108,108,0.4);
            }
            &.rank-2 {
              background: #E6A23C;
              color: white;
              box-shadow: 0 2px 4px rgba(230,162,60,0.4);
            }
            &.rank-3 {
              background: #67C23A;
              color: white;
              box-shadow: 0 2px 4px rgba(103,194,58,0.4);
            }
          }

          .user-name {
            flex: 1;
            color: #606266;
            font-size: 14px;
          }

          .user-score {
            color: #409EFF;
            font-weight: bold;
            font-size: 14px;
          }
        }
      }
    }
  }

  .behavior-stats {
    padding: 10px;

    .behavior-item {
      display: flex;
      align-items: center;
      padding: 20px;
      transition: all 0.3s ease;
      border-radius: 8px;

      &:hover {
        background-color: #f5f7fa;
        transform: translateY(-2px);
      }

      .behavior-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: rgba(64, 158, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        transition: all 0.3s ease;

        i {
          font-size: 24px;
          color: #409EFF;
        }

        &:hover {
          background: rgba(64, 158, 255, 0.2);
          transform: scale(1.05);
        }
      }

      .behavior-info {
        .behavior-value {
          font-size: 20px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }

        .behavior-label {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}
</style>
