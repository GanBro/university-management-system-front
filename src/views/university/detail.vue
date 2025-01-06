<!-- src/views/university/detail.vue -->
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <!-- 标题部分 -->
      <div slot="header" class="clearfix">
        <span>高校详情</span>
        <el-button style="float: right; margin-left: 10px" size="mini" @click="handleEdit">
          编辑
        </el-button>
        <el-button style="float: right" size="mini" @click="goBack">
          返回
        </el-button>
      </div>

      <!-- 基本信息 -->
      <div class="info-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>高校名称:</label>
              <span>{{ universityDetail.name }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>所在地:</label>
              <span>{{ universityDetail.province }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>学校类型:</label>
              <span>{{ universityDetail.type }}</span>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>学校层次:</label>
              <span>{{ universityDetail.level }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>主管部门:</label>
              <span>{{ universityDetail.adminDepartment }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>官方网站:</label>
              <a :href="universityDetail.website" target="_blank">{{ universityDetail.website }}</a>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <div class="detail-item">
              <label>招生网站:</label>
              <a :href="universityDetail.admissionWebsite" target="_blank">{{ universityDetail.admissionWebsite }}</a>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>详细地址:</label>
              <span>{{ universityDetail.address }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="detail-item">
              <label>特色标签:</label>
              <div class="tag-container">
                <el-tag
                  v-for="feature in universityDetail.features"
                  :key="feature"
                  type="success"
                  class="feature-tag"
                >
                  {{ feature }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 分数线组件 -->
      <admission-scores
        :scores="universityDetail.admissionScores"
        class="section-margin"
      />

      <!-- 专业满意度评分 -->
      <div class="rating-section">
        <div class="section-title">专业满意度评分</div>
        <el-table
          v-if="universityDetail.satisfactionRatings && universityDetail.satisfactionRatings.length"
          :data="universityDetail.satisfactionRatings"
          border
          style="width: 100%"
        >
          <el-table-column prop="category" label="专业类别" />
          <el-table-column label="评分" width="300">
            <template slot-scope="scope">
              <div class="rating-container">
                <el-rate
                  v-model="scope.row.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="ratingCount" label="评分人数">
            <template slot-scope="scope">
              {{ scope.row.ratingCount }}人评价
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-state">
          <el-alert
            title="暂无评分数据"
            type="info"
            center
            :closable="false"
          >
          </el-alert>
        </div>
      </div>

      <!-- 专业推荐评分 -->
      <div class="rating-section">
        <div class="section-title">专业推荐评分</div>
        <el-table
          v-if="universityDetail.recommendationRatings && universityDetail.recommendationRatings.length"
          :data="universityDetail.recommendationRatings"
          border
          style="width: 100%"
        >
          <el-table-column prop="majorCategory" label="专业类别" />
          <el-table-column label="评分" width="300">
            <template slot-scope="scope">
              <div class="rating-container">
                <el-rate
                  v-model="scope.row.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="recommendationCount" label="推荐人数">
            <template slot-scope="scope">
              {{ scope.row.recommendationCount }}人推荐
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-state">
          <el-alert
            title="暂无推荐数据"
            type="info"
            center
            :closable="false"
          >
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getUniversityDetail } from '@/api/university'
import AdmissionScores from './components/AdmissionScores.vue'

export default {
  name: 'UniversityDetail',
  components: {
    AdmissionScores
  },
  data() {
    return {
      loading: false,
      universityDetail: {
        features: [],
        admissionScores: [],
        satisfactionRatings: [],
        recommendationRatings: []
      }
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      this.loading = true
      try {
        const { data } = await getUniversityDetail(this.$route.params.id)
        this.universityDetail = data
      } catch (error) {
        console.error('Failed to get university detail:', error)
        this.$message.error('获取高校详情失败')
      } finally {
        this.loading = false
      }
    },
    handleEdit() {
      this.$router.push(`/university/edit/${this.$route.params.id}`)
    },
    goBack() {
      this.$router.push('/university/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.info-section {
  margin-bottom: 30px;
}

.detail-item {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;

  label {
    font-weight: bold;
    margin-right: 10px;
    color: #606266;
    width: 84px;
    flex-shrink: 0;
  }

  a, span {
    flex: 1;
    word-break: break-all;
  }

  .tag-container {
    flex: 1;
    .feature-tag {
      margin-right: 10px;
      margin-bottom: 5px;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 30px 0 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.rating-section {
  margin-top: 30px;
}

.rating-container {
  display: flex;
  align-items: center;
}

.section-margin {
  margin: 30px 0;
}

.empty-state {
  padding: 32px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .el-rate__text {
  margin-left: 10px;
}

::v-deep .el-table {
  border-radius: 8px;
  overflow: hidden;
}

::v-deep .el-table th {
  background-color: #f8fafc;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
</style>
