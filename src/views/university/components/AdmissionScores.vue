<!-- src/views/university/components/AdmissionScores.vue -->
<template>
  <div class="admission-scores-section">
    <div class="section-header">
      <div class="section-title">录取分数线趋势</div>
      <el-select
        v-model="selectedProvince"
        placeholder="选择省份"
        class="province-select"
        @change="handleProvinceChange"
      >
        <el-option
          v-for="province in provinces"
          :key="province"
          :label="province"
          :value="province"
        />
      </el-select>
    </div>

    <div v-if="selectedProvince && chartData.length" class="chart-container">
      <div class="chart-info">
        <div class="province-title">
          {{ selectedProvince }}历年分数线趋势
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-dot"></span>
            <span>分数线</span>
          </div>
        </div>
      </div>

      <ve-line
        :data="chartData"
        :settings="chartSettings"
        :extend="chartExtend"
        height="400px"
      />
    </div>
    <div v-else class="empty-state">
      <el-alert
        :title="selectedProvince ? '暂无该省份的分数线数据' : '请选择省份查看分数线趋势'"
        type="info"
        center
        :closable="false"
      >
      </el-alert>
    </div>

    <!-- 详细数据表格 -->
    <div v-if="selectedProvince && filteredScores.length" class="detail-table">
      <div class="table-title">详细数据</div>
      <el-table
        :data="filteredScores"
        border
        stripe
      >
        <el-table-column prop="year" label="年份" width="180" />
        <el-table-column prop="scoreRequired" label="分数线">
          <template slot-scope="scope">
            <div class="score-cell">
              <span>{{ scope.row.scoreRequired }}</span>
              <span
                v-if="scope.row.trend"
                :class="getTrendClass(scope.row.trend)"
                class="trend-indicator"
              >
                {{ scope.row.trend > 0 ? `↑${scope.row.trend}` : `↓${Math.abs(scope.row.trend)}` }}
              </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import VeLine from 'v-charts/lib/line.common'

export default {
  name: 'AdmissionScores',
  components: {
    VeLine
  },
  props: {
    scores: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      selectedProvince: '',
      chartSettings: {
        labelMap: {
          year: '年份',
          scoreRequired: '分数线'
        }
      },
      chartExtend: {
        series: {
          smooth: true,
          showSymbol: true,
          symbolSize: 8,
          lineStyle: {
            width: 3
          }
        },
        grid: {
          top: 40,
          right: 20,
          bottom: 60,
          left: 60
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 0,
          textStyle: {
            color: '#666'
          },
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        xAxis: {
          axisLine: {
            show: true,
            lineStyle: {
              color: '#eee'
            }
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          splitLine: {
            lineStyle: {
              color: '#eee'
            }
          }
        }
      }
    }
  },
  computed: {
    provinces() {
      // 确保数据不为空
      if (!this.scores || !Array.isArray(this.scores)) {
        return []
      }
      return [...new Set(this.scores.map(score => score.province))]
    },
    filteredScores() {
      if (!this.selectedProvince || !this.scores) return []

      // 调试日志
      console.log('Selected Province:', this.selectedProvince)
      console.log('All Scores:', this.scores)

      const scores = this.scores
        .filter(score => score.province === this.selectedProvince)
        .sort((a, b) => a.year - b.year)
        .map(score => ({
          year: score.year,
          scoreRequired: score.scoreRequired || score.分数线 || score.分数, // 增加可能的字段匹配
          province: score.province
        }))

      console.log('Filtered Scores:', scores)

      return scores.map((score, index) => ({
        ...score,
        trend: index > 0 ? score.scoreRequired - scores[index - 1].scoreRequired : null
      }))
    },
    chartData() {
      if (!this.filteredScores.length) return { columns: ['year', 'scoreRequired'], rows: [] }

      return {
        columns: ['year', 'scoreRequired'],
        rows: this.filteredScores.map(score => ({
          year: score.year,
          scoreRequired: score.scoreRequired
        }))
      }
    }
  },
  methods: {
    handleProvinceChange(province) {
      this.selectedProvince = province
    },
    getTrendClass(trend) {
      return trend > 0 ? 'trend-up' : 'trend-down'
    }
  },
  created() {
    if (this.provinces.length === 1) {
      this.selectedProvince = this.provinces[0]
    }
  }
}
</script>

<style lang="scss" scoped>
.admission-scores-section {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.province-select {
  width: 200px;
}

.chart-container {
  margin-top: 20px;
}

.chart-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.province-title {
  font-size: 14px;
  color: #666;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409EFF;
}

.detail-table {
  margin-top: 30px;
}

.table-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
}

.score-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-indicator {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.trend-up {
  color: #f56c6c;
  background-color: #fef0f0;
}

.trend-down {
  color: #67c23a;
  background-color: #f0f9eb;
}

.empty-state {
  padding: 32px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table th {
  background-color: #f8fafc;
}

::v-deep .el-table td,
::v-deep .el-table th {
  padding: 8px 0;
}
</style>
