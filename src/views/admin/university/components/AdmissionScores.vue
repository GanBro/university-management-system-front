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
          <el-tooltip effect="dark" placement="top">
            <div slot="content">
              <div>计划人数：{{ scope.row.planCount }}人</div>
              <div>实际人数：{{ scope.row.actualCount }}人</div>
              <div>完成率：{{ calculateCompletionRate(scope.row) }}%</div>
            </div>
            <span>{{ scope.row.planCount }}/{{ scope.row.actualCount }}</span>
          </el-tooltip>
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
          <el-progress
              :percentage="calculateCompletionRate(scope.row)"
              :status="getProgressStatus(scope.row)"
          />
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
  // 移除局部组件注册
  // components: {
  //   'el-empty': Empty
  // },
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

      const currentYear = new Date().getFullYear()
      const latestYearData = this.scores.filter(s => s.year === currentYear)

      return [
        {
          label: '平均分数线',
          value: Math.round(_.meanBy(this.filteredScores, 'scoreRequired')) + '分'
        },
        {
          label: '计划招生总数',
          value: _.sumBy(latestYearData, 'planCount') + '人'
        },
        {
          label: '实际录取总数',
          value: _.sumBy(latestYearData, 'actualCount') + '人'
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
    // 计算完成率
    calculateCompletionRate(row) {
      if (!row.planCount || !row.actualCount) return 0
      return Math.round((row.actualCount / row.planCount) * 100)
    },
    // 获取进度条状态
    getProgressStatus(row) {
      const rate = this.calculateCompletionRate(row)
      if (rate >= 100) return 'success'
      if (rate >= 90) return 'success' // 根据需要调整
      if (rate >= 80) return 'warning'
      return 'exception'
    },
    // 获取分数变化
    getScoreDiff(row) {
      const prevYearScore = this.scores.find(
          s => s.year === row.year - 1 && s.province === row.province
      )
      if (!prevYearScore) return null

      const diff = row.scoreRequired - prevYearScore.scoreRequired
      if (diff === 0) return null
      return diff > 0 ? `+${diff}` : diff.toString()
    },
    // 获取分数变化样式
    getScoreDiffClass(row) {
      const diff = this.getScoreDiff(row)
      if (!diff) return ''
      return {
        'score-up': diff.startsWith('+'),
        'score-down': !diff.startsWith('+')
      }
    }
  },
  watch: {
    scores: {
      immediate: true,
      handler(newScores) {
        if (newScores && newScores.length && !this.selectedProvince) {
          // 默认选择第一个省份
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
}

::v-deep {
  .el-progress-bar__outer {
    background-color: #ebeef5;
  }

  .el-table th {
    background-color: #f5f7fa;
    color: #606266;
  }

  .el-table {
    margin-top: 20px;
  }

  .el-progress {
    margin-bottom: 0;
  }

  .el-progress-bar__inner {
    transition: width 0.3s ease;
  }
}
</style>
