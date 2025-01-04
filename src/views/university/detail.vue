<!-- src/views/university/detail.vue -->
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
            <label>所在省份:</label>
            <span>{{ universityDetail.province }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-item">
            <label>所在城市:</label>
            <span>{{ universityDetail.city }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <div class="detail-item">
            <label>学校类型:</label>
            <span>{{ universityDetail.type }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-item">
            <label>学校层次:</label>
            <span>{{ universityDetail.level }}</span>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="detail-item">
            <label>主管部门:</label>
            <span>{{ universityDetail.admin_department }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="detail-item">
            <label>官方网站:</label>
            <a :href="universityDetail.website" target="_blank">{{ universityDetail.website }}</a>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="detail-item">
            <label>招生网站:</label>
            <a :href="universityDetail.admission_website" target="_blank">{{ universityDetail.admission_website }}</a>
          </div>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <div class="detail-item">
            <label>详细地址:</label>
            <span>{{ universityDetail.address }}</span>
          </div>
        </el-col>
      </el-row>

      <!-- 添加录取分数线信息 -->
      <div class="section-title">录取分数线</div>
      <el-table :data="admissionScores" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="province" label="省份" width="180" />
        <el-table-column prop="year" label="年份" width="180" />
        <el-table-column prop="score_required" label="分数线" />
      </el-table>

      <!-- 添加专业满意度评分 -->
      <div class="section-title">专业满意度评分</div>
      <el-table :data="satisfactionRatings" border style="width: 100%; margin-top: 20px;">
        <el-table-column prop="category" label="专业类别" />
        <el-table-column prop="rating" label="评分">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        <el-table-column prop="rating_count" label="评分人数" />
      </el-table>
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
      universityDetail: {},
      admissionScores: [],
      satisfactionRatings: []
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
        this.admissionScores = data.admissionScores || []
        this.satisfactionRatings = data.satisfactionRatings || []
      } catch (error) {
        console.error('Failed to get university detail:', error)
      }
      this.loading = false
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
  label {
    font-weight: bold;
    margin-right: 10px;
    color: #606266;
  }
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}
</style>
