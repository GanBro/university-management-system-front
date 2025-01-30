<!--src/views/admin/dashboard/index.vue-->
<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span class="card-title">总高校数量</span>
            <el-tooltip content="系统中所有高校的总数" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="card-body">
            <div class="card-value">{{ stats.totalUniversityCount }}</div>
            <div class="card-trend" v-if="stats.recentUniversityCount">
              <span :class="getTrendClass(stats.recentUniversityCount)">
                <i :class="getTrendIcon(stats.recentUniversityCount)"></i>
                {{ formatTrend(stats.recentUniversityCount) }}
              </span>
              <span class="trend-label">较上月</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span class="card-title">活跃用户</span>
            <el-tooltip content="过去7天的活跃用户数量" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="card-body">
            <div class="card-value">{{ stats.activeUserCount }}</div>
            <div class="card-trend">
              <span :class="getTrendClass(stats.monthlyActiveUserCount - stats.activeUserCount)">
                <i :class="getTrendIcon(stats.monthlyActiveUserCount - stats.activeUserCount)"></i>
                {{ formatTrend(stats.monthlyActiveUserCount - stats.activeUserCount) }}
              </span>
              <span class="trend-label">较上周</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span class="card-title">互动总数</span>
            <el-tooltip content="用户互动咨询的总数量" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="card-body">
            <div class="card-value">{{ stats.totalInteractionCount }}</div>
            <div class="sub-value">
              <span class="pending">待处理: {{ stats.pendingInteractionCount }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span class="card-title">平均响应时间</span>
            <el-tooltip content="互动响应的平均处理时间" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="card-body">
            <div class="card-value">{{ formatDuration(stats.avgResponseTime) }}</div>
            <div class="card-metric">
              <el-progress
                :percentage="stats.responseRate"
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
              <el-radio-group v-model="mapViewType" size="small" @change="handleMapViewChange">
                <el-radio-button label="distribution">分布视图</el-radio-button>
                <el-radio-button label="heat">热力视图</el-radio-button>
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
            <el-radio-group v-model="trendTimeRange" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="quarter">季</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
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
              <el-col :span="8">
                <div class="behavior-item">
                  <div class="behavior-icon">
                    <i class="el-icon-chat-dot-square"></i>
                  </div>
                  <div class="behavior-info">
                    <div class="behavior-value">{{ stats.userBehaviorStats.consultationCount }}</div>
                    <div class="behavior-label">咨询数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="behavior-item">
                  <div class="behavior-icon">
                    <i class="el-icon-message"></i>
                  </div>
                  <div class="behavior-info">
                    <div class="behavior-value">{{ stats.userBehaviorStats.replyCount }}</div>
                    <div class="behavior-label">回复数</div>
                  </div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="behavior-item">
                  <div class="behavior-icon">
                    <i class="el-icon-star-on"></i>
                  </div>
                  <div class="behavior-info">
                    <div class="behavior-value">{{ stats.userBehaviorStats.followCount }}</div>
                    <div class="behavior-label">关注数</div>
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
      mapViewType: 'distribution',
      trendTimeRange: 'month',
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
      handler(newVal) {
        if (this.charts.mapChart) {
          this.$nextTick(() => {
            this.renderMap()
          })
        }
      }
    },
    trendTimeRange: {
      handler(newVal) {
        this.fetchDataByTimeRange(newVal)
      }
    },
    'stats.universityDistribution': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.renderMap()
        }
      }
    },
    'stats.growthTrend': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.renderTrendChart()
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
      'fetchDataByTimeRange'
    ]),

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
      const mapDom = document.getElementById('university-map')
      if (mapDom) {
        this.charts.mapChart = echarts.init(mapDom)
      }

      const trendDom = document.getElementById('growth-trend-chart')
      if (trendDom) {
        this.charts.trendChart = echarts.init(trendDom)
      }

      window.addEventListener('resize', this.handleResize)
    },

    handleResize() {
      Object.values(this.charts).forEach(chart => {
        chart && chart.resize()
      })
    },

    disposeCharts() {
      Object.values(this.charts).forEach(chart => {
        chart && chart.dispose()
      })
    },

    renderCharts() {
      this.renderMap()
      this.renderTrendChart()
    },

    handleMapViewChange(viewType) {
      this.mapViewType = viewType
    },

    renderMap() {
      if (!this.charts.mapChart || !this.stats.universityDistribution) return

      echarts.registerMap('china', chinaJson)

      const option = {
        title: {
          text: '高校地理分布',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `${params.name}<br/>高校数量：${params.value || 0}所`
          }
        },
        visualMap: {
          min: 0,
          max: Math.max(...this.stats.universityDistribution.map(item => item.count)),
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true,
          inRange: {
            color: this.mapViewType === 'heat'
              ? ['#feeb61', '#f7854e', '#f43d25']
              : ['#e0f3f8', '#045a8d']
          }
        },
        // todo: 解决点击周月季年后显示异常问题
        series: [{
          name: '高校分布',
          type: 'map',
          mapType: 'china',
          roam: true,
          emphasis: {
            label: { show: true }
          },
          data: this.stats.universityDistribution.map(item => ({
            name: item.province,
            value: item.count
          })),
          itemStyle: this.mapViewType === 'heat' ? {
            areaColor: '#031525',
            borderColor: '#3B5077'
          } : {},
          emphasis: {
            itemStyle: {
              areaColor: this.mapViewType === 'heat' ? '#2B91B7' : undefined
            }
          }
        }]
      }

      this.charts.mapChart.setOption(option, {
        transition: ['color', 'itemStyle'],
        duration: 1000
      })
    },

    renderTrendChart() {
      if (!this.charts.trendChart || !this.stats.growthTrend) return

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}所高校'
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
          data: this.stats.growthTrend.map(item => item.year)
        },
        yAxis: {
          type: 'value',
          name: '高校数量',
          nameTextStyle: {
            padding: [0, 30, 0, 0]
          }
        },
        series: [
          {
            name: '高校数量',
            type: 'line',
            smooth: true,
            data: this.stats.growthTrend.map(item => item.university_count),
            areaStyle: {
              opacity: 0.3
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
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

          .pending {
            color: #E6A23C;
          }
        }

        .card-metric {
          margin-top: 10px;
        }
      }
    }
  }

  .map-header,
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .trend-section {
    margin: 20px 0;

    .rank-card {
      .rank-list {
        .rank-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #EBEEF5;

          &:last-child {
            border-bottom: none;
          }

          .rank-number {
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border-radius: 50%;
            margin-right: 10px;
            font-size: 12px;
            color: #909399;

            &.rank-1 { background: #F56C6C; color: white; }
            &.rank-2 { background: #E6A23C; color: white; }
            &.rank-3 { background: #67C23A; color: white; }
          }

          .user-name {
            flex: 1;
            color: #606266;
          }

          .user-score {
            color: #409EFF;
            font-weight: bold;
          }
        }
      }
    }
  }

  .behavior-stats {
    .behavior-item {
      display: flex;
      align-items: center;
      padding: 20px;

      .behavior-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: rgba(64, 158, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;

        i {
          font-size: 24px;
          color: #409EFF;
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
