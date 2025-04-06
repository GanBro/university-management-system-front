<!--src/components/MajorSatisfactionCard.vue-->
<template>
  <el-card class="major-satisfaction-card mb-4">
    <div class="card-header">
      <span class="title">专业满意度评价</span>
      <el-tooltip content="基于在校生及毕业生对各专业的综合评价" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <div class="more" @click="$emit('more')">更多&gt;</div>
    </div>

    <div v-if="majorSatisfaction && majorSatisfaction.length > 0" class="rating-content">
      <!-- 图表展示 -->
      <div ref="chartContainer" class="chart-container"></div>

      <!-- 列表展示 -->
      <div class="rating-list">
        <div v-for="(item, index) in processedData" :key="index" class="rating-item">
          <div class="rank-badge" :class="getRankClass(index)">{{ index + 1 }}</div>
          <div class="item-content">
            <div class="item-header">
              <span class="major-name">{{ item.name }}</span>
              <div class="rating-info">
                <el-rate
                  v-if="item.rating !== undefined && item.rating !== null"
                  v-model="item.ratingValue"
                  disabled
                  text-color="#ff9900"
                  score-template="{value}"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  :max="5"
                  :show-score="false"
                >
                </el-rate>
                <span v-else class="no-rating">暂无评分</span>
                <span v-if="item.rating" class="rating">{{ item.rating.toFixed(1) }}</span>
              </div>
            </div>
            <div class="item-footer">
              <el-progress
                v-if="item.rating"
                :percentage="item.rating * 20"
                :stroke-width="8"
                :color="getRatingColor(item.rating)"
              ></el-progress>
              <el-progress
                v-else
                :percentage="0"
                :stroke-width="8"
                :color="getRatingColor(0)"
              ></el-progress>
              <span class="count">({{ item.count || 0 }}人评价)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-text">
      暂无专业满意度数据
    </div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'MajorSatisfactionCard',
  props: {
    majorSatisfaction: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  computed: {
    // 为rating-value计算值，并处理可能的null值
    processedData() {
      return this.majorSatisfaction.map(item => ({
        ...item,
        ratingValue: item.rating !== undefined && item.rating !== null ? item.rating : 0
      })).sort((a, b) => {
        // 按评分降序排序，处理null值
        if (a.rating === undefined || a.rating === null) return 1;
        if (b.rating === undefined || b.rating === null) return -1;
        return b.rating - a.rating;
      });
    }
  },
  watch: {
    majorSatisfaction: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.initChart()
          })
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    if (this.majorSatisfaction && this.majorSatisfaction.length > 0) {
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
    getRankClass(index) {
      const classes = ['rank-1', 'rank-2', 'rank-3']
      return index < 3 ? classes[index] : 'rank-normal'
    },
    getRatingColor(rating) {
      if (!rating || rating <= 0) return '#909399';  // 灰色 - 无评分
      if (rating >= 4.5) return '#10b981'  // 绿色
      if (rating >= 4.0) return '#3b82f6'  // 蓝色
      return '#f59e0b'  // 橙色
    },
    initChart() {
      if (!this.$refs.chartContainer || this.majorSatisfaction.length === 0) return

      // 销毁旧图表
      if (this.chart) {
        this.chart.dispose()
      }

      // 初始化图表
      this.chart = echarts.init(this.$refs.chartContainer)

      // 准备数据 - 过滤掉无评分的专业
      const data = this.processedData
        .filter(item => item.rating !== undefined && item.rating !== null)
        .slice(0, 5)
        .map(item => ({
          name: item.name,
          value: item.rating * 20,  // 转换为百分比
          count: item.count || 0
        }));

      // 检查是否有有效数据
      if (data.length === 0) {
        // 如果没有有效评分数据，显示提示信息
        this.chart.setOption({
          title: {
            text: '暂无专业评分数据',
            left: 'center',
            top: 'center',
            textStyle: {
              fontSize: 14,
              color: '#909399'
            }
          }
        });
        return;
      }

      // 图表配置
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            return `${params.name}<br/>满意度: ${(params.value / 20).toFixed(1)}<br/>评价人数: ${params.data.count}人`
          }
        },
        series: [
          {
            name: '专业满意度',
            type: 'pie',
            radius: ['30%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}%'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: data
          }
        ],
        color: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
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
.major-satisfaction-card {
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

  .rating-content {
    .chart-container {
      height: 250px;
      margin-bottom: 20px;
    }

    .rating-list {
      .rating-item {
        display: flex;
        align-items: flex-start;
        padding: 12px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .rank-badge {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: #ddd;
          color: #fff;
          font-weight: bold;
          font-size: 12px;
          margin-right: 12px;
          flex-shrink: 0;

          &.rank-1 {
            background-color: #f59e0b;
          }

          &.rank-2 {
            background-color: #60a5fa;
          }

          &.rank-3 {
            background-color: #10b981;
          }

          &.rank-normal {
            background-color: #9ca3af;
          }
        }

        .item-content {
          flex: 1;

          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .major-name {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }

            .rating-info {
              display: flex;
              align-items: center;

              .el-rate {
                margin-right: 4px;
              }

              .rating {
                font-size: 14px;
                font-weight: bold;
                color: #f59e0b;
              }

              .no-rating {
                font-size: 12px;
                color: #909399;
                font-style: italic;
              }
            }
          }

          .item-footer {
            display: flex;
            align-items: center;

            .el-progress {
              width: 70%;
              margin-right: 10px;
            }

            .count {
              font-size: 12px;
              color: #999;
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
