<template>
  <div class="major-satisfaction">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>专业满意度</span>
        <el-button style="float: right;" size="small" @click="goBack">返回</el-button>
      </div>

      <!-- 专业满意度概览 -->
      <div class="satisfaction-overview">
        <el-table
          :data="majorSatisfaction"
          border
          style="width: 100%"
          :default-sort="{prop: 'rating', order: 'descending'}"
        >
          <el-table-column prop="name" label="专业名称" min-width="180" />
          <el-table-column label="满意度评分" width="200" sortable prop="rating">
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
          <el-table-column prop="count" label="评分人数" width="120" sortable>
            <template slot-scope="scope">
              {{ scope.row.count }}人评分
            </template>
          </el-table-column>
          <el-table-column label="评分分布" min-width="300">
            <template slot-scope="scope">
              <div class="rating-distribution">
                <div v-for="(value, star) in scope.row.distribution" :key="star" class="distribution-item">
                  <span class="star-label">{{ star }}星</span>
                  <el-progress
                    :percentage="value"
                    :color="getRatingColor(parseInt(star))"
                    :show-text="false"
                  />
                  <span class="percentage">{{ value }}%</span>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 评分详情列表 -->
      <div class="rating-details">
        <div class="section-title">评分详情</div>
        <el-table :data="ratingList" border style="width: 100%">
          <el-table-column prop="majorName" label="专业" width="180" />
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
          <el-table-column prop="comment" label="评价内容" />
          <el-table-column prop="rater" label="评价人" width="120" />
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
  name: 'MajorSatisfactionDetail',

  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      ratingList: []
    }
  },

  computed: {
    ...mapState({
      majorSatisfaction: state => state.university.majorSatisfaction || []
    })
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        await Promise.all([
          this.fetchMajorSatisfaction(),
          this.fetchRatingList()
        ])
      } catch (error) {
        console.error('获取专业满意度数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchMajorSatisfaction() {
      await this.$store.dispatch('university/getMajorSatisfaction', this.$route.params.id)
    },

    async fetchRatingList() {
      // TODO: 实现获取详细评分列表的接口
    },

    getRatingColor(rating) {
      const colors = {
        1: '#F56C6C',
        2: '#E6A23C',
        3: '#67C23A',
        4: '#409EFF',
        5: '#10b981'
      }
      return colors[rating] || '#909399'
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
.major-satisfaction {
  padding: 20px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  .satisfaction-overview {
    margin-bottom: 30px;
  }

  .rating-distribution {
    .distribution-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;

      .star-label {
        width: 40px;
        text-align: right;
        font-size: 12px;
        color: #666;
      }

      .el-progress {
        flex: 1;
      }

      .percentage {
        width: 40px;
        font-size: 12px;
        color: #666;
      }
    }
  }

  .rating-details {
    margin-top: 30px;
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
