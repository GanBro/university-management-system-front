<!--src/views/user/components/MajorRecommendationCard.vue-->
<template>
  <el-card class="major-recommendation-card mb-4">
    <div class="card-header">
      <span class="title">专业推荐分析</span>
      <el-tooltip content="基于用户投票的专业推荐数据" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <div class="more" @click="$emit('more')">更多&gt;</div>
    </div>

    <div v-if="hasRecommendationData" class="recommendation-content">
      <!-- 切换视图 -->
      <div class="view-tabs">
        <el-radio-group v-model="activeView" size="mini">
          <el-radio-button label="list">列表视图</el-radio-button>
          <el-radio-button label="chart">图表视图</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 图表视图 -->
      <div v-show="activeView === 'chart'" class="chart-view">
        <div ref="chartContainer" class="chart-container"></div>
      </div>

      <!-- 列表视图 -->
      <div v-show="activeView === 'list'" class="list-view">
        <div v-for="(item, index) in sortedRecommendations" :key="index" class="recommendation-item">
          <div class="item-header">
            <span class="major-name">{{ item.name }}</span>
            <div class="indicator-badge" :style="{ backgroundColor: getColorByIndex(index) }">
              {{ getIndicatorText(item) }}
            </div>
          </div>

          <div class="item-body">
            <div class="metrics">
              <div class="metric">
                <span class="label">推荐指数：</span>
                <span class="value">{{ item.rating ? item.rating.toFixed(1) : '暂无' }}</span>
                <el-rate
                  v-if="item.rating"
                  v-model="item.ratingValue"
                  disabled
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  :max="5"
                  :show-score="false"
                  text-color="#ff9900"
                >
                </el-rate>
              </div>
              <div class="metric">
                <span class="label">推荐人数：</span>
                <span class="value count">{{ item.count }}人</span>
              </div>
            </div>

            <el-progress
              :percentage="getCompletionPercentage(item.count)"
              :stroke-width="8"
              :color="getRecommendationColor(item.count)"
            ></el-progress>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-text">
      暂无专业推荐数据
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'MajorRecommendationCard',
  props: {
    recommendationCounts: {
      type: Array,
      default: () => []
    },
    recommendationIndex: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeView: 'list',
      chart: null,
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#0ea5e9', '#14b8a6', '#a3e635', '#f43f5e']
    }
  },
  computed: {
    hasRecommendationData() {
      return (this.recommendationCounts && this.recommendationCounts.length > 0) ||
        (this.recommendationIndex && this.recommendationIndex.length > 0)
    },
    // 合并两个数据源并添加计算属性
    sortedRecommendations() {
      const mergedMap = new Map()

      // 添加推荐人数数据
      if (this.recommendationCounts) {
        this.recommendationCounts.forEach(item => {
          mergedMap.set(item.name, {
            name: item.name,
            count: item.count,
            rating: null
          })
        })
      }

      // 添加推荐指数数据
      if (this.recommendationIndex) {
        this.recommendationIndex.forEach(item => {
          if (mergedMap.has(item.name)) {
            const existingItem = mergedMap.get(item.name)
            existingItem.rating = item.rating
            existingItem.ratingValue = item.rating // 为el-rate准备的值
          } else {
            mergedMap.set(item.name, {
              name: item.name,
              count: item.count,
              rating: item.rating,
              ratingValue: item.rating
            })
          }
        })
      }

      // 转为数组并按推荐人数排序
      return Array.from(mergedMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    }
  },
  watch: {
    activeView(newVal) {
      if (newVal === 'chart') {
        this.$nextTick(() => {
          this.initChart()
        })
      }
    },
    sortedRecommendations: {
      handler(newVal) {
        if (newVal.length > 0 && this.activeView === 'chart') {
          this.$nextTick(() => {
            this.initChart()
          })
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.hasRecommendationData && this.activeView === 'chart') {
      this.initChart()
    }

    // 监听窗口大小变化
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    // 清除事件监听
    window.removeEventListener('resize', this.resizeChart)

    // 销毁图表实例
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    getColorByIndex(index) {
      return this.colors[index % this.colors.length]
    },
    getIndicatorText(item) {
      return `TOP${item.rating ? item.rating.toFixed(1) : ''}`
    },
    getCompletionPercentage(count) {
      if (!count) return 0
      const maxCount = Math.max(...this.sortedRecommendations.map(item => item.count))
      return Math.round((count / maxCount) * 100)
    },
    getRecommendationColor(count) {
      const maxCount = Math.max(...this.sortedRecommendations.map(item => item.count))
      const percentage = (count / maxCount) * 100

      if (percentage >= 90) return '#10b981'  // 绿色
      if (percentage >= 70) return '#3b82f6'  // 蓝色
      if (percentage >= 50) return '#f59e0b'  // 橙色
      return '#9ca3af'  // 灰色
    },
    initChart() {
      if (!this.$refs.chartContainer || !this.sortedRecommendations.length) return

      // 销毁旧图表
      if (this.chart) {
        this.chart.dispose()
      }

      // 初始化图表
      this.chart = echarts.init(this.$refs.chartContainer)

      // 准备数据
      const data = this.sortedRecommendations.map((item, index) => ({
        name: item.name,
        value: [item.rating || 0, item.count, item.name],
        itemStyle: {
          color: this.getColorByIndex(index)
        }
      }))

      // 图表配置
      const option = {
        title: {
          text: '专业推荐分布',
          left: 'center',
          top: 0,
          textStyle: {
            fontSize: 14
          }
        },
        grid: {
          left: '5%',
          right: '15%',
          bottom: '10%',
          top: '15%',
          containLabel: true
        },
        tooltip: {
          formatter: function(params) {
            return `${params.data.name}<br/>推荐指数: ${params.data.value[0].toFixed(1)}<br/>推荐人数: ${params.data.value[1]}人`
          }
        },
        xAxis: {
          type: 'value',
          name: '推荐指数',
          nameLocation: 'middle',
          nameGap: 30,
          min: 0,
          max: 5,
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '推荐人数',
          nameLocation: 'middle',
          nameGap: 30,
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [
          {
            type: 'scatter',
            symbolSize: function(data) {
              // 根据推荐人数动态设置气泡大小
              return Math.sqrt(data[1]) * 2 + 10
            },
            data: data.map(item => ({
              name: item.name,
              value: item.value,
              itemStyle: item.itemStyle
            })),
            label: {
              show: true,
              formatter: '{b}',
              position: 'right',
              color: '#333'
            },
            emphasis: {
              label: {
                show: true,
                color: '#000',
                fontSize: 14,
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              }
            }
          }
        ]
      }

      // 渲染图表
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
.major-recommendation-card {
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

    .more {
      margin-left: auto;
      color: #666;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .recommendation-content {
    .view-tabs {
      text-align: center;
      margin-bottom: 20px;
    }

    .chart-view {
      .chart-container {
        height: 350px;
      }
    }

    .list-view {
      .recommendation-item {
        margin-bottom: 15px;
        padding: 12px;
        border-radius: 6px;
        background-color: #f9fafb;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .major-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
          }

          .indicator-badge {
            padding: 2px 8px;
            border-radius: 12px;
            color: white;
            font-size: 12px;
            font-weight: 500;
          }
        }

        .item-body {
          .metrics {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;

            .metric {
              display: flex;
              align-items: center;

              .label {
                font-size: 12px;
                color: #666;
                margin-right: 4px;
              }

              .value {
                font-size: 14px;
                font-weight: 500;
                color: #333;
                margin-right: 4px;

                &.count {
                  color: #3b82f6;
                }
              }

              .el-rate {
                margin-top: 1px;
              }
            }
          }
        }
      }
    }
  }

  .empty-text {
    text-align: center;
    color: #999;
    padding: 40px 0;
    font-size: 14px;
  }
}
</style>
