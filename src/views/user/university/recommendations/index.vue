<!--src/views/user/university/recommendations/index.vue-->
<template>
  <div class="recommendations">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>专业推荐</span>
        <el-button style="float: right;" size="small" @click="goBack">返回</el-button>
      </div>

      <div class="recommendation-tabs">
        <el-tabs v-model="activeTab">
          <!-- 专业推荐人数 -->
          <el-tab-pane label="推荐人数" name="counts">
            <div class="recommendation-list">
              <el-table
                :data="recommendationCounts"
                border
                style="width: 100%"
                :default-sort="{prop: 'count', order: 'descending'}"
              >
                <el-table-column prop="name" label="专业名称" min-width="180" />
                <el-table-column prop="count" label="推荐人数" width="150" sortable>
                  <template slot-scope="scope">
                    {{ scope.row.count }}人推荐
                  </template>
                </el-table-column>
                <el-table-column label="趋势" width="200">
                  <template slot-scope="scope">
                    <div class="trend-chart">
                      <el-progress
                        :percentage="getPercentage(scope.row.count)"
                        :color="getProgressColor(scope.row.count)"
                        :show-text="false"
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      @click="handleRecommend(scope.row)"
                    >推荐该专业</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 专业推荐指数 -->
          <el-tab-pane label="推荐指数" name="index">
            <div class="recommendation-list">
              <el-table
                :data="recommendationIndex"
                border
                style="width: 100%"
                :default-sort="{prop: 'rating', order: 'descending'}"
              >
                <el-table-column prop="name" label="专业名称" min-width="180" />
                <el-table-column label="推荐指数" width="200" sortable prop="rating">
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
                <el-table-column prop="count" label="评价人数" width="120" sortable>
                  <template slot-scope="scope">
                    {{ scope.row.count }}人评价
                  </template>
                </el-table-column>
                <el-table-column label="评价分布" min-width="300">
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
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 推荐详情列表 -->
      <div class="recommendation-details">
        <div class="section-title">推荐详情</div>
        <el-table :data="recommendationList" border style="width: 100%">
          <el-table-column prop="majorName" label="专业" width="180" />
          <el-table-column prop="type" label="类型" width="120">
            <template slot-scope="scope">
              <el-tag :type="scope.row.type === 'recommend' ? 'success' : 'warning'">
                {{ scope.row.type === 'recommend' ? '推荐' : '评分' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="rating" label="评分" width="180">
            <template slot-scope="scope">
              <el-rate
                v-if="scope.row.type === 'rating'"
                v-model="scope.row.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="comment" label="评价内容" />
          <el-table-column prop="recommender" label="推荐人" width="120" />
          <el-table-column prop="createTime" label="时间" width="180" />
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

      <!-- 推荐对话框 -->
      <el-dialog
        title="专业推荐"
        :visible.sync="dialogVisible"
        width="500px"
      >
        <el-form :model="recommendForm" :rules="rules" ref="recommendForm" label-width="80px">
          <el-form-item label="专业" prop="majorName">
            <el-input v-model="recommendForm.majorName" disabled />
          </el-form-item>
          <el-form-item label="评分" prop="rating">
            <el-rate v-model="recommendForm.rating" />
          </el-form-item>
          <el-form-item label="评价" prop="comment">
            <el-input
              type="textarea"
              v-model="recommendForm.comment"
              :rows="4"
              placeholder="请输入推荐理由或评价内容"
            />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitRecommendation">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'UniversityRecommendations',

  data() {
    return {
      loading: false,
      activeTab: 'counts',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      recommendationList: [],
      dialogVisible: false,
      recommendForm: {
        majorName: '',
        majorId: null,
        rating: 0,
        comment: ''
      },
      rules: {
        rating: [
          { required: true, message: '请选择评分', trigger: 'change' }
        ],
        comment: [
          { required: true, message: '请输入评价内容', trigger: 'blur' },
          { min: 10, max: 500, message: '评价内容长度在 10 到 500 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    ...mapState({
      recommendationCounts: state => state.university.recommendations.counts || [],
      recommendationIndex: state => state.university.recommendations.index || []
    }),

    universityId() {
      return this.$route.params.id
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
          this.$store.dispatch('university/getRecommendations', this.universityId),
          this.fetchRecommendationList()
        ])
      } catch (error) {
        console.error('获取推荐数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchRecommendationList() {
      // TODO: 实现获取推荐详情列表的接口
    },

    getPercentage(count) {
      const max = Math.max(...this.recommendationCounts.map(item => item.count))
      return (count / max) * 100
    },

    getProgressColor(count) {
      const max = Math.max(...this.recommendationCounts.map(item => item.count))
      const percentage = (count / max) * 100
      if (percentage >= 80) return '#67C23A'
      if (percentage >= 50) return '#409EFF'
      return '#909399'
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

    handleRecommend(row) {
      this.recommendForm.majorName = row.name
      this.recommendForm.majorId = row.id
      this.recommendForm.rating = 0
      this.recommendForm.comment = ''
      this.dialogVisible = true
    },

    submitRecommendation() {
      this.$refs.recommendForm.validate(async valid => {
        if (valid) {
          try {
            // TODO: 实现提交推荐的接口
            await this.$store.dispatch('university/submitRecommendation', {
              universityId: this.universityId,
              recommendationData: this.recommendForm
            })
            this.$message.success('提交推荐成功')
            this.dialogVisible = false
            this.fetchData()
          } catch (error) {
            console.error('提交推荐失败:', error)
            this.$message.error('提交推荐失败，请重试')
          }
        }
      })
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchRecommendationList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchRecommendationList()
    },

    goBack() {
      this.$router.push({
        name: 'UserUniversityDetail',
        params: { id: this.universityId }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.recommendations {
  padding: 20px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  .recommendation-list {
    margin-bottom: 30px;
  }

  .trend-chart {
    width: 100%;
    padding: 10px;
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

  .recommendation-details {
    margin-top: 30px;
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
