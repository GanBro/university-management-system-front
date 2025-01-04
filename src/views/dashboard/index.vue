<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="6">
        <el-card>
          <h3>总高校数量</h3>
          <p>{{ stats.totalUniversityCount }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>最近新增高校数量</h3>
          <p>{{ stats.recentUniversityCount }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>活跃用户数量（7天）</h3>
          <p>{{ stats.activeUserCount }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>月活跃用户数量（30天）</h3>
          <p>{{ stats.monthlyActiveUserCount }}</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高校分布地图 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <h3>高校分布地图</h3>
          <div id="university-map" style="height: 400px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高校数量增长趋势 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <h3>高校数量增长趋势</h3>
          <div id="university-growth-chart" style="height: 400px; width: 100%;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 高校分布表格 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <h3>高校分布</h3>
          <el-table :data="stats.universityDistribution" border style="width: 100%">
            <el-table-column prop="province" label="省份" width="150"></el-table-column>
            <el-table-column prop="count" label="高校数量" width="150"></el-table-column>
          </el-table>
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
  computed: {
    ...mapState('dashboard', ['stats']) // 从 Vuex 映射仪表盘数据
  },
  methods: {
    ...mapActions('dashboard', ['fetchStats']), // 映射 Vuex 的获取方法

    // 渲染高校分布地图
    renderUniversityMap() {
      if (!this.stats.universityDistribution || this.stats.universityDistribution.length === 0) {
        console.warn('高校分布数据为空，无法渲染地图！')
        return
      }

      echarts.registerMap('china', chinaJson)

      const chartDom = document.getElementById('university-map')
      if (!chartDom) {
        console.error('找不到高校分布图表的DOM元素！')
        return
      }

      const myChart = echarts.init(chartDom)

      const option = {
        title: { text: '高校分布地图', left: 'center' },
        tooltip: { trigger: 'item', formatter: '{b}: {c} 所高校' },
        visualMap: {
          min: 0,
          max: Math.max(...this.stats.universityDistribution.map(item => item.count)) || 10,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: true,
            data: this.stats.universityDistribution.map(item => ({
              name: item.province,
              value: item.count
            }))
          }
        ]
      }

      myChart.setOption(option)
      myChart.resize()
    },

    // 渲染高校增长趋势折线图
    // 渲染高校增长趋势折线图
    renderGrowthChart() {
      if (!this.stats.growthTrend || this.stats.growthTrend.length === 0) {
        console.warn('高校增长趋势数据为空，无法渲染折线图！')
        return
      }

      console.log('Rendering Growth Chart with data:', this.stats.growthTrend)

      this.$nextTick(() => {
        const chartDom = document.getElementById('university-growth-chart')
        if (!chartDom) {
          console.error('找不到高校增长趋势图表的DOM元素！')
          return
        }

        // 如果图表已存在，销毁它以防止重复初始化
        if (chartDom._echarts_instance_) {
          echarts.dispose(chartDom)
        }

        const myChart = echarts.init(chartDom)

        const years = this.stats.growthTrend.map(item => item.year)
        const counts = this.stats.growthTrend.map(item => item.university_count)

        console.log('Years:', years)
        console.log('Counts:', counts)

        const option = {
          title: { text: '高校数量增长趋势', left: 'center' },
          tooltip: { trigger: 'axis' },
          xAxis: {
            type: 'category',
            data: years,
            boundaryGap: false // 让折线图从 X 轴起点开始
          },
          yAxis: {
            type: 'value',
            minInterval: 1, // 确保 Y 轴刻度间隔至少为1
            axisLabel: {
              formatter: '{value}' // 强制标签显示为整数
            }
          },
          series: [
            {
              name: '高校数量',
              type: 'line',
              data: counts,
              smooth: true,
              lineStyle: {
                color: '#5470C6'
              },
              itemStyle: {
                color: '#5470C6'
              }
            }
          ]
        }

        myChart.setOption(option)
        myChart.resize()
      })
    },

    // 加载仪表盘数据
    loadDashboardData() {
      this.fetchStats()
        .then(() => {
          console.log('仪表盘数据加载成功:', this.stats)
          console.log('高校增长趋势数据:', this.stats.growthTrend)
          if (chinaJson && this.stats.universityDistribution.length > 0) {
            this.renderUniversityMap()
          }
          if (this.stats.growthTrend.length > 0) {
            this.renderGrowthChart()
          }
        })
        .catch(error => {
          console.error('仪表盘数据加载失败:', error)
        })
    }
  },
  watch: {
    'stats.growthTrend': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.renderGrowthChart()
        }
      },
      immediate: true
    },
    'stats.universityDistribution': { // 监听高校分布数据的变化
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.renderUniversityMap()
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.loadDashboardData()
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-cards {
  margin-bottom: 20px;
}

#university-map,
#university-growth-chart {
  margin-top: 20px;
  height: 400px;
  width: 100%; /* 确保宽度为100% */
}
</style>
