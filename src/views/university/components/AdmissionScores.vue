<template>
  <div class="admission-scores">
    <div class="section-header">
      <div class="title">录取分数线</div>
      <el-select v-model="selectedProvince" placeholder="选择省份">
        <el-option v-for="province in provinces" :key="province" :label="province" :value="province" />
      </el-select>
    </div>

    <!-- 趋势图 -->
    <div v-if="hasData" class="chart-container" ref="chart"></div>

    <!-- 详细数据表格 -->
    <el-table v-if="hasData" :data="filteredScores" border style="margin-top: 20px">
      <el-table-column prop="year" label="年份" width="180" />
      <el-table-column prop="scoreRequired" label="分数线">
        <template slot-scope="scope">
          <div class="score-cell">
            <span>{{ scope.row.scoreRequired }}</span>
            <span v-if="scope.row.change" :class="['change', scope.row.change > 0 ? 'up' : 'down']">
              {{ scope.row.change > 0 ? '+' : ''}}{{ scope.row.change }}
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div v-else class="empty-state">
      <el-alert
        :title="selectedProvince ? '暂无该省份的分数线数据' : '请选择省份查看分数线'"
        type="info"
        center
        :closable="false"
      />
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  name: 'AdmissionScores',
  props: {
    scores: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedProvince: '',
      chart: null
    }
  },
  computed: {
    provinces() {
      return _.uniq(this.scores.map(s => s.province))
    },
    filteredScores() {
      if (!this.selectedProvince || !this.scores) return []

      const filtered = this.scores
        .filter(s => s.province === this.selectedProvince)
        .sort((a, b) => a.year - b.year)

      return filtered.map((score, index) => ({
        ...score,
        change: index > 0 ? score.scoreRequired - filtered[index - 1].scoreRequired : null
      }))
    },
    hasData() {
      return this.filteredScores.length > 0
    }
  },
  watch: {
    scores: {
      handler(newScores) {
        if (newScores.length && !this.selectedProvince) {
          this.selectedProvince = this.provinces[0]
        }
      },
      immediate: true
    },
    filteredScores: {
      handler() {
        this.$nextTick(() => {
          this.initChart()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    initChart() {
      if (!this.hasData) return

      if (!this.chart) {
        this.chart = echarts.init(this.$refs.chart)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}年分数线: {c}分'
        },
        grid: {
          top: 40,
          left: 60,
          right: 20,
          bottom: 40
        },
        xAxis: {
          type: 'category',
          data: this.filteredScores.map(item => item.year),
          axisTick: { show: false },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: 500,
          max: 700,
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee'
            }
          }
        },
        series: [{
          type: 'line',
          data: this.filteredScores.map(item => item.scoreRequired),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#409EFF'
          },
          lineStyle: {
            width: 3,
            color: '#409EFF'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(64,158,255,0.2)'
              }, {
                offset: 1,
                color: 'rgba(64,158,255,0)'
              }]
            }
          }
        }]
      }

      this.chart.setOption(option)
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.admission-scores {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .title {
    font-weight: bold;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
  }
}

.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .change {
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;

    &.up {
      color: #F56C6C;
      background: #FEF0F0;
    }

    &.down {
      color: #67C23A;
      background: #F0F9EB;
    }
  }
}

.empty-state {
  padding: 32px 0;
  display: flex;
  justify-content: center;
}
</style>
