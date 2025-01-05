<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>高校详情</span>
        <el-button style="float: right; margin-left: 10px" size="mini" @click="handleEdit">
          编辑
        </el-button>
        <el-button style="float: right" size="mini" @click="goBack">
          返回
        </el-button>
      </div>

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

      <!-- 第二行 -->
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

      <!-- 第三行 -->
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

      <!-- 录取分数线信息 -->
      <div class="section-title">录取分数线</div>
      <el-table
        :data="universityDetail.admissionScores"
        border
        style="width: 100%; margin-top: 20px;"
        v-if="universityDetail.admissionScores && universityDetail.admissionScores.length"
      >
        <el-table-column prop="province" label="省份" width="180" />
        <el-table-column prop="year" label="年份" width="180" />
        <el-table-column prop="scoreRequired" label="分数线" />
      </el-table>
      <el-empty v-else description="暂无分数线数据" />

      <!-- 专业满意度评分 -->
      <div class="section-title">专业满意度评分</div>
      <el-table
        :data="universityDetail.satisfactionRatings"
        border
        style="width: 100%; margin-top: 20px;"
        v-if="universityDetail.satisfactionRatings && universityDetail.satisfactionRatings.length"
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
      <el-empty v-else description="暂无评分数据" />

      <!-- 专业推荐评分 -->
      <div class="section-title">专业推荐评分</div>
      <el-table
        :data="universityDetail.recommendationRatings"
        border
        style="width: 100%; margin-top: 20px;"
        v-if="universityDetail.recommendationRatings && universityDetail.recommendationRatings.length"
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
      <el-empty v-else description="暂无推荐数据" />

    </el-card>
  </div>
</template>

<script>
import { getUniversityDetail } from '@/api/university'

export default {
  name: 'UniversityDetail',
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

.rating-container {
  display: flex;
  align-items: center;
  .el-rate {
    margin-right: 10px;
  }
}

.el-rate .el-rate__text {
  margin-left: 10px;
}

.app-container {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}
</style>
