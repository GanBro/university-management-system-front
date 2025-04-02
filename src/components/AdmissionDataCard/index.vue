<template>
  <el-card class="admission-data-card" v-loading="loading">
    <div class="card-header">
      <span class="title">招生数据</span>
      <el-tooltip content="历年招生分数线及录取情况" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
    </div>

    <!-- 省份和年份筛选 -->
    <div class="filter-container">
      <el-select
        v-model="selectedProvince"
        placeholder="选择省份"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in provinceOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
      <el-select
        v-model="selectedYear"
        placeholder="选择年份"
        clearable
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in yearOptions"
          :key="item"
          :label="formatYearLabel(item)"
          :value="item"
        />
      </el-select>
      <el-button type="primary" icon="el-icon-search" class="filter-item" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <!-- 数据表格 -->
    <div v-if="filteredData.length > 0">
      <el-table
        :data="filteredData"
        border
        style="width: 100%"
        highlight-current-row
      >
        <el-table-column prop="province" label="省份" width="120" align="center" />
        <el-table-column label="年份" width="100" align="center">
          <template slot-scope="scope">
            {{ formatYear(scope.row.year) }}
          </template>
        </el-table-column>
        <el-table-column prop="scoreRequired" label="最低分数线" width="120" align="center">
          <template slot-scope="scope">
            <span class="score">{{ scope.row.scoreRequired }}</span>
          </template>
        </el-table-column>
        <el-table-column label="计划/实际人数" width="150" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.planCount || '-' }}/{{ scope.row.actualCount || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lowestRank" label="最低位次" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.lowestRank ? scope.row.lowestRank.toLocaleString() : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成率" width="180" align="center">
          <template slot-scope="scope">
            <template v-if="calculateCompletionRate(scope.row)">
              <el-progress
                :percentage="calculateCompletionRate(scope.row)"
                :status="getProgressStatus(scope.row)"
              />
              <span class="completion-text">{{ calculateCompletionRate(scope.row).toFixed(1) }}%</span>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="empty-data">
      <i class="el-icon-data-line"></i>
      <p>暂无符合条件的招生数据</p>
    </div>

    <!-- 历年分数线趋势图 -->
    <div class="admission-trend" v-if="hasYearlyData">
      <div class="trend-title">历年分数线趋势</div>
      <div class="chart-container" ref="chartContainer"></div>
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'
import { mapState } from 'vuex'

export default {
  name: 'AdmissionDataCard',
  props: {
    universityId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      selectedProvince: '',
      selectedYear: '',
      chart: null,
      resizeTimer: null
    }
  },
  computed: {
    ...mapState({
      admissionData: state => state.university.admissionData || []
    }),
    provinceOptions() {
      if (!this.admissionData || !this.admissionData.length) return []
      // 提取所有省份并去重
      return [...new Set(this.admissionData.map(item => item.province))].sort()
    },
    yearOptions() {
      if (!this.admissionData || !this.admissionData.length) return []
      // 提取所有年份并去重
      return [...new Set(this.admissionData.map(item => this.extractYear(item.year)))].sort((a, b) => b - a)
    },
    filteredData() {
      if (!this.admissionData || !this.admissionData.length) return []

      return this.admissionData.filter(item => {
        const itemYear = this.extractYear(item.year)

        // 如果没有选择省份和年份，返回所有数据
        if (!this.selectedProvince && !this.selectedYear) return true

        // 如果只选择了省份，按省份筛选
        if (this.selectedProvince && !this.selectedYear) {
          return item.province === this.selectedProvince
        }

        // 如果只选择了年份，按年份筛选
        if (!this.selectedProvince && this.selectedYear) {
          return itemYear == this.selectedYear
        }

        // 如果同时选择了省份和年份，同时筛选
        return item.province === this.selectedProvince && itemYear == this.selectedYear
      })
    },
    hasYearlyData() {
      // 判断是否有足够的数据显示趋势图
      // 如果筛选了省份，则按该省份的数据判断
      // 如果没有筛选省份，则只要有年份数据，就可以显示趋势图
      if (this.selectedProvince) {
        const provinceData = this.admissionData.filter(item => item.province === this.selectedProvince)
        return provinceData.length > 1
      } else if (this.provinceOptions.length > 0) {
        // 没有选择省份但有省份选项，显示第一个省份的趋势
        const firstProvince = this.provinceOptions[0]
        const provinceData = this.admissionData.filter(item => item.province === firstProvince)
        return provinceData.length > 1
      }
      return false
    },
    trendChartProvince() {
      // 确定趋势图显示的省份
      if (this.selectedProvince) {
        return this.selectedProvince
      } else if (this.provinceOptions.length > 0) {
        return this.provinceOptions[0]
      }
      return null
    }
  },
  watch: {
    admissionData: {
      handler(newVal) {
        if (newVal && newVal.length) {
          this.$nextTick(() => {
            if (this.hasYearlyData) {
              this.initChartWithDelay()
            }
          })
        }
      },
      immediate: true,
      deep: true
    },
    trendChartProvince: {
      handler() {
        this.$nextTick(() => {
          if (this.hasYearlyData) {
            this.initChartWithDelay()
          }
        })
      }
    },
    universityId: {
      handler(newVal) {
        if (newVal) {
          this.fetchAdmissionData()
        }
      },
      immediate: true
    }
  },
  mounted() {
    // 监听窗口大小变化，重新渲染图表
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 清除事件监听
    window.removeEventListener('resize', this.handleResize)

    // 清除定时器
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }

    // 销毁图表实例
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    async fetchAdmissionData() {
      try {
        this.loading = true
        await this.$store.dispatch('university/getAdmissionData', this.universityId)
      } catch (error) {
        console.error('获取招生数据失败:', error)
        this.$message.error('获取招生数据失败，请稍后再试')
      } finally {
        this.loading = false
      }
    },
    handleFilter() {
      // 筛选条件改变后，更新图表
      this.$nextTick(() => {
        if (this.hasYearlyData) {
          this.initChartWithDelay()
        }
      })
    },
    // 提取年份（处理字符串或数字格式的年份）
    extractYear(yearValue) {
      if (!yearValue) return null

      // 如果是数字，直接返回
      if (typeof yearValue === 'number') return yearValue

      // 如果是字符串，尝试提取年份部分
      if (typeof yearValue === 'string') {
        // 尝试提取YYYY-MM-DD格式中的年份
        const match = yearValue.match(/^(\d{4})/)
        if (match) return parseInt(match[1])

        // 如果只是数字字符串，转为数字
        if (/^\d+$/.test(yearValue)) return parseInt(yearValue)
      }

      // 如果是日期对象，提取年份
      if (yearValue instanceof Date) {
        return yearValue.getFullYear()
      }

      return yearValue
    },
    // 格式化年份显示
    formatYear(yearValue) {
      const year = this.extractYear(yearValue)
      return year ? `${year}年` : '-'
    },
    // 格式化下拉选项标签
    formatYearLabel(yearValue) {
      const year = this.extractYear(yearValue)
      return year ? `${year}年` : '-'
    },
    // 计算完成率
    calculateCompletionRate(row) {
      if (!row.planCount || !row.actualCount) return 0
      const rate = (row.actualCount / row.planCount) * 100
      return Math.min(rate, 100) // 最大100%
    },
    // 获取进度条状态
    getProgressStatus(row) {
      const rate = this.calculateCompletionRate(row)
      if (!rate) return 'info'
      if (rate >= 100) return 'success'
      if (rate >= 90) return 'success'
      if (rate >= 80) return 'warning'
      return 'exception'
    },
    getProvinceData(province) {
      if (!this.admissionData) return []

      // 筛选指定省份数据并按年份升序排序用于图表显示
      return this.admissionData
        .filter(item => item.province === province)
        .sort((a, b) => {
          const yearA = this.extractYear(a.year)
          const yearB = this.extractYear(b.year)
          return yearA - yearB
        })
    },
    // 处理窗口大小变化
    handleResize() {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }

      this.resizeTimer = setTimeout(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 200)
    },
    // 延迟初始化图表，确保DOM已完全渲染
    initChartWithDelay() {
      setTimeout(() => {
        this.initChart()
      }, 300)
    },
    initChart() {
      if (!this.$refs.chartContainer || !this.trendChartProvince) return

      const provinceData = this.getProvinceData(this.trendChartProvince)
      if (!provinceData || provinceData.length <= 1) return

      // 销毁旧图表
      if (this.chart) {
        this.chart.dispose()
      }

      // 初始化图表
      this.chart = echarts.init(this.$refs.chartContainer)

      // 准备数据 - 确保年份只是数字
      const years = provinceData.map(item => this.extractYear(item.year))
      const scores = provinceData.map(item => item.scoreRequired)
      const ranks = provinceData.map(item => item.lowestRank)

      // 处理最低分和最高分，确保Y轴合理显示
      const minScore = Math.min(...scores.filter(s => s)) || 0
      const maxScore = Math.max(...scores.filter(s => s)) || 750

      // 计算Y轴刻度范围 - 分数线
      const scoreMin = Math.max(0, Math.floor(minScore / 100) * 100)
      const scoreMax = Math.min(750, Math.ceil(maxScore / 100) * 100)

      // 计算Y轴间隔
      const scoreInterval = Math.max(50, Math.ceil((scoreMax - scoreMin) / 5 / 50) * 50)

      // 图表配置
      const option = {
        title: {
          text: `${this.trendChartProvince}历年分数线趋势`,
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          formatter: function(params) {
            const yearData = params[0]
            const scoreData = params[0]
            const rankData = params.length > 1 ? params[1] : null

            let html = `${yearData.name}年<br/>`
            html += `分数线: ${scoreData.value || '暂无数据'}<br/>`
            if (rankData && rankData.value) {
              html += `最低位次: ${rankData.value.toLocaleString()}`
            }

            return html
          }
        },
        legend: {
          data: ['分数线', '最低位次'],
          bottom: 0
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: 40,
          top: 50,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: years,
          name: '年份',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}年', // 显示年份时添加"年"字
            rotate: 0
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '分数线',
            position: 'left',
            min: scoreMin,
            max: scoreMax,
            interval: scoreInterval,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5470c6'
              }
            },
            axisLabel: {
              formatter: '{value}'
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed'
              }
            }
          },
          {
            type: 'value',
            name: '最低位次',
            position: 'right',
            inverse: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: '#91cc75'
              }
            },
            axisLabel: {
              formatter: function(value) {
                if (value >= 10000) {
                  return (value / 10000).toFixed(1) + 'w'
                }
                return value
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: '分数线',
            type: 'line',
            data: scores,
            yAxisIndex: 0,
            connectNulls: true,
            symbolSize: 8,
            itemStyle: {
              color: '#5470c6'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 4,
              padding: [2, 4],
              distance: 10
            }
          },
          {
            name: '最低位次',
            type: 'line',
            data: ranks,
            yAxisIndex: 1,
            connectNulls: true,
            symbolSize: 8,
            itemStyle: {
              color: '#91cc75'
            },
            label: {
              show: true,
              position: 'bottom',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 4,
              padding: [2, 4],
              distance: 10,
              formatter: function(params) {
                if (params.value) {
                  if (params.value >= 10000) {
                    return (params.value / 10000).toFixed(1) + 'w'
                  }
                  return params.value
                }
                return ''
              }
            }
          }
        ]
      }

      // 渲染图表
      this.chart.setOption(option)
    }
  }
}
</script>

<style lang="scss" scoped>
.admission-data-card {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .el-icon-info {
      margin-left: 4px;
      font-size: 14px;
      color: #999;
    }
  }

  .filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;

    .filter-item {
      margin-bottom: 10px;
      width: 180px;
    }
  }

  .score {
    font-weight: bold;
    color: #f56c6c;
  }

  .empty-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }

  .admission-trend {
    margin-top: 30px;

    .trend-title {
      font-size: 15px;
      font-weight: 500;
      color: #333;
      margin-bottom: 15px;
      padding-left: 10px;
      border-left: 3px solid #409EFF;
    }

    .chart-container {
      height: 300px;
      width: 100%;
      min-width: 400px; /* 确保图表容器有最小宽度 */
    }
  }

  .completion-text {
    margin-left: 10px;
    font-size: 12px;
    color: #606266;
  }
}
</style>
