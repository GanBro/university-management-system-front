<!--src/views/admin/university/components/AdmissionScores.vue-->
<template>
  <div class="admission-scores">
    <!-- 总体统计卡片 -->
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="8" v-for="(stat, index) in statisticsData" :key="index">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="stat-item">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 省份和年份筛选 -->
    <div class="filter-section">
      <el-select v-model="selectedProvince" placeholder="选择省份" clearable>
        <el-option
            v-for="item in provinceOptions"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
      <el-select v-model="selectedYear" placeholder="选择年份" clearable>
        <el-option
            v-for="item in yearOptions"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
    </div>

    <!-- 录取数据表格 -->
    <el-table
        v-loading="loading"
        :data="filteredScores"
        border
        style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="year" label="年份" width="100" align="center" />
      <el-table-column prop="province" label="省份" width="120" align="center" />
      <el-table-column label="计划/实际人数" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ formatEnrollmentCount(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最低录取分数" align="center">
        <template slot-scope="scope">
          <div class="score-cell">
            <span class="score-value">{{ scope.row.scoreRequired }}</span>
            <span
                v-if="getScoreDiff(scope.row)"
                :class="getScoreDiffClass(scope.row)"
            >
              {{ getScoreDiff(scope.row) }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="lowestRank" label="最低位次" width="120" align="center">
        <template slot-scope="scope">
          <span class="rank-value">
            {{ scope.row.lowestRank ? scope.row.lowestRank.toLocaleString() : '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="完成率" width="180" align="center">
        <template slot-scope="scope">
          <template v-if="hasValidEnrollmentData(scope.row)">
            <el-progress
                :percentage="calculateCompletionRate(scope.row)"
                :status="getProgressStatus(scope.row)"
            />
            <span class="completion-rate">{{ calculateCompletionRate(scope.row).toFixed(2) }}%</span>
          </template>
          <template v-else>
            <div class="progress-placeholder">
              <i :class="getCompletionIcon(scope.row)"></i>
            </div>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 无数据提示 -->
    <div v-if="!filteredScores.length" class="empty-data">
      <el-empty :description="emptyText" />
    </div>
  </div>
</template>

<script>
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
      loading: false,
      selectedProvince: '',
      selectedYear: ''
    }
  },
  computed: {
    // 省份选项
    provinceOptions() {
      return _.uniq(this.scores.map(item => item.province))
    },
    // 年份选项
    yearOptions() {
      return _.uniq(this.scores.map(item => item.year)).sort((a, b) => b - a)
    },
    // 过滤后的分数数据
    filteredScores() {
      return this.scores
          .filter(score => {
            const matchProvince = !this.selectedProvince || score.province === this.selectedProvince
            const matchYear = !this.selectedYear || score.year === this.selectedYear
            return matchProvince && matchYear
          })
          .sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year
            return a.province.localeCompare(b.province)
          })
    },
    // 统计数据
    statisticsData() {
      if (!this.filteredScores.length) return []

      const latestYear = Math.max(...this.filteredScores.map(s => s.year))
      const relevantData = this.selectedYear
          ? this.filteredScores
          : this.filteredScores.filter(s => s.year === latestYear)

      const validData = relevantData.filter(this.hasValidEnrollmentData)

      return [
        {
          label: '平均分数线',
          value: this.calculateAverageScore(relevantData)
        },
        {
          label: '计划招生总数',
          value: this.formatNumberWithUnit(_.sumBy(validData, 'planCount'), '人')
        },
        {
          label: '实际录取总数',
          value: this.formatNumberWithUnit(_.sumBy(validData, 'actualCount'), '人')
        }
      ]
    },
    // 空数据提示文本
    emptyText() {
      if (this.selectedProvince && this.selectedYear) {
        return '暂无该省份该年份的录取数据'
      } else if (this.selectedProvince) {
        return '暂无该省份的录取数据'
      } else if (this.selectedYear) {
        return '暂无该年份的录取数据'
      }
      return '暂无录取数据'
    }
  },
  methods: {
    // 计算平均分数线
    calculateAverageScore(data) {
      const average = _.meanBy(data, 'scoreRequired')
      if (!average) return '-'
      return Math.round(average) + '分'
    },
    // 格式化数字并添加单位
    formatNumberWithUnit(number, unit = '') {
      if (!number && number !== 0) return '-'
      return number.toLocaleString() + unit
    },
    // 检查是否有有效的招生数据
    hasValidEnrollmentData(row) {
      return row.planCount &&
          row.actualCount &&
          row.planCount !== '/' &&
          row.actualCount !== '/' &&
          typeof row.planCount === 'number' &&
          typeof row.actualCount === 'number'
    },
    // 格式化招生人数显示
    formatEnrollmentCount(row) {
      if (!row.planCount || !row.actualCount ||
          row.planCount === '/' || row.actualCount === '/') {
        return '/'
      }
      return `${row.planCount}/${row.actualCount}`
    },
    // 计算完成率
    calculateCompletionRate(row) {
      if (!this.hasValidEnrollmentData(row)) return 0;
      const rate = (row.actualCount / row.planCount) * 100;
      return Math.min(rate, 100); // 返回百分比值，最大为100
    },
    // 获取完成率状态图标
    getCompletionIcon(row) {
      // 当数据无效时显示叉号图标
      return 'el-icon-close'
    },
    // 获取进度条状态
    getProgressStatus(row) {
      if (!this.hasValidEnrollmentData(row)) return 'info'
      const rate = this.calculateCompletionRate(row)
      if (rate >= 100) return 'success'
      if (rate >= 90) return 'success'
      if (rate >= 80) return 'warning'
      return 'exception'
    },
    // 获取分数变化
    getScoreDiff(row) {
      const prevYearScore = this.scores.find(
          s => s.year === row.year - 1 && s.province === row.province
      )
      if (!prevYearScore || !row.scoreRequired || !prevYearScore.scoreRequired) return null

      const diff = row.scoreRequired - prevYearScore.scoreRequired
      if (diff === 0) return null
      return diff > 0 ? `+${diff}` : diff.toString()
    },
    // 获取分数变化样式
    getScoreDiffClass(row) {
      const diff = this.getScoreDiff(row)
      if (!diff) return ''
      return diff.startsWith('+') ? 'score-up' : 'score-down'
    }
  },
  watch: {
    scores: {
      immediate: true,
      handler(newScores) {
        if (newScores?.length && !this.selectedProvince) {
          const provinces = _.uniq(newScores.map(s => s.province))
          if (provinces.length) {
            this.selectedProvince = provinces[0]
          }
        }
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

  .stat-cards {
    margin-bottom: 20px;

    .stat-item {
      text-align: center;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .filter-section {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;

    .el-select {
      min-width: 120px;
    }
  }

  .score-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .score-value {
      font-weight: bold;
      color: #303133;
    }

    .score-up {
      color: #F56C6C;
      font-size: 13px;
    }

    .score-down {
      color: #67C23A;
      font-size: 13px;
    }
  }

  .rank-value {
    color: #67C23A;
    font-weight: bold;
  }

  .empty-data {
    padding: 40px 0;
    text-align: center;
  }

  .progress-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #F56C6C;

    i {
      font-size: 18px;
    }
  }

  .completion-rate {
    font-size: 14px;
    color: #606266;
    margin-left: 8px;
  }
}

::v-deep {
  .el-progress-bar__outer {
    background-color: #ebeef5;
  }

  .el-table th {
    background-color: #f5f7fa;
    color: #606266;
  }

  .el-progress {
    margin-bottom: 0;
    width: 90%;
    margin: 0 auto;
  }

  .el-progress-bar__inner {
    transition: width 0.3s ease;
  }

  .el-tooltip__popper {
    max-width: 200px;
  }
}
</style>
