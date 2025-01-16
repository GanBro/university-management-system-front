<!--src/views/user/university/satisfaction/index.vue-->
<template>
  <div class="satisfaction-detail">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>满意度详情</span>
        <el-button style="float: right;" size="small" @click="goBack">返回</el-button>
      </div>

      <!-- 总体评分 -->
      <div class="rating-overview">
        <el-row :gutter="20">
          <el-col :span="8" v-for="(item, index) in satisfactionRatings" :key="index">
            <div class="rating-card">
              <el-progress
                type="circle"
                :percentage="item.rating * 20"
                :stroke-width="8"
                :width="120"
                :color="getRatingColor(item.rating)"
              >
                <div class="circle-content">
                  <div class="rating">{{ item.rating.toFixed(1) }}</div>
                  <div class="count">{{ item.count }}人评价</div>
                </div>
              </el-progress>
              <div class="label">{{ item.label }}</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 评分趋势 -->
      <div class="rating-trends">
        <div class="section-title">评分趋势</div>
        <div class="chart-container">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="综合满意度" name="overall">
              <div class="chart">
                // 这里使用echarts绘制趋势图
              </div>
            </el-tab-pane>
            <el-tab-pane label="环境满意度" name="environment">
              <div class="chart">
                // 环境满意度趋势图
              </div>
            </el-tab-pane>
            <el-tab-pane label="生活满意度" name="life">
              <div class="chart">
                // 生活满意度趋势图
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 评分详情列表 -->
      <div class="rating-list">
        <div class="section-title">评分记录</div>
        <el-table :data="ratingList" border style="width: 100%">
          <el-table-column prop="category" label="评分类别" width="150" />
          <el-table-column prop="rating" label="评分" width="180">
            <template slot-scope="scope">
              <el-rate
                v-model="scope.row.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </template>
          </el-table-column>
          <el-table-column prop="rater" label="评价人" width="120" />
          <el-table-column prop="comment" label="评价内容" />
          <el-table-column prop="rateTime" label="评价时间" width="180" />
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'UniversitySatisfactionDetail',

  data() {
    return {
      loading: false,
      activeTab: 'overall',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      ratingList: []
    }
  },

  computed: {
    ...mapState({
      satisfactionData: state => state.university.satisfactionData || {},
    }),

    satisfactionRatings() {
      return [
        {
          label: '综合满意度',
          rating: this.satisfactionData.overall || 0,
          count: this.satisfactionData.overall_count || 0
        },
        {
          label: '环境满意度',
          rating: this.satisfactionData.environment || 0,
          count: this.satisfactionData.environment_count || 0
        },
        {
          label: '生活满意度',
          rating: this.satisfactionData.life || 0,
          count: this.satisfactionData.life_count || 0
        }
      ]
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        await Promise.all([
          this.fetchSatisfactionData(),
          this.fetchRatingList()
        ])
      } catch (error) {
        console.error('获取满意度数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchSatisfactionData() {
      await this.$store.dispatch('university/getSatisfactionData', this.$route.params.id)
    },

    async fetchRatingList() {
      // 调用API获取评分列表
      // 这里需要实现相应的API和store action
    },

    getRatingColor(rating) {
      if (rating >= 4.5) return '#10b981'  // 绿色
      if (rating >= 4.0) return '#3b82f6'  // 蓝色
      return '#f59e0b'  // 橙色
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchRatingList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchRatingList()
    },

    goBack() {
      this.$router.push({
        name: 'UserUniversityDetail',
        params: { id: this.$route.params.id }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.satisfaction-detail {
  padding: 20px;

  .rating-overview {
    margin-bottom: 30px;

    .rating-card {
      text-align: center;
      padding: 20px;

      .circle-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        .rating {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .count {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }

      .label {
        margin-top: 12px;
        font-size: 14px;
        color: #666;
      }
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  .chart-container {
    margin: 20px 0;
    height: 400px;

    .chart {
      width: 100%;
      height: 100%;
    }
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }
}

.clearfix:after {
  content: "";
  display: table;
  clear: both;
}
</style>
