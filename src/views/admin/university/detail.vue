<!--src/views/admin/university/detail.vue-->
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
        <el-form label-width="120px" class="basic-info">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="学校名称">
                <span>{{ universityDetail.name }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="所在地">
                <span>{{ universityDetail.province }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="学校类型">
                <span>{{ universityDetail.type }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="学校层次">
                <span>{{ universityDetail.level }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="主管部门">
                <span>{{ universityDetail.adminDepartment }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话">
                <span>{{ universityDetail.contactNumber }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 学校规模信息 -->
        <div class="section-title">学校规模</div>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover" class="scale-card">
              <div class="scale-item">
                <div class="scale-value">{{ universityDetail.studentCount ? universityDetail.studentCount.toLocaleString() : '-' }}</div>
                <div class="scale-label">在校生数量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="scale-card">
              <div class="scale-item">
                <div class="scale-value">{{ universityDetail.teacherCount ? universityDetail.teacherCount.toLocaleString() : '-' }}</div>
                <div class="scale-label">教师数量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="scale-card">
              <div class="scale-item">
                <div class="scale-value">{{ universityDetail.libraryCount ? universityDetail.libraryCount.toLocaleString() : '-' }}</div>
                <div class="scale-label">图书馆藏书量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover" class="scale-card">
              <div class="scale-item">
                <div class="scale-value">{{ universityDetail.campusArea ? (universityDetail.campusArea / 10000).toFixed(2) : '-' }}</div>
                <div class="scale-label">校园面积(万平方米)</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

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

        <div class="detail-item">
          <label>官方网站:</label>
          <a :href="universityDetail.website" target="_blank">{{ universityDetail.website }}</a>
        </div>

        <div class="detail-item">
          <label>招生网站:</label>
          <a :href="universityDetail.admissionWebsite" target="_blank">{{ universityDetail.admissionWebsite }}</a>
        </div>

        <div class="detail-item">
          <label>详细地址:</label>
          <span>{{ universityDetail.address }}</span>
        </div>
      </div>

      <!-- 学校简介 -->
      <div v-if="universityDetail.introduction" class="detail-section">
        <div class="section-title">学校简介</div>
        <markdown-renderer :content="universityDetail.introduction" />
      </div>

      <!-- 院系设置 -->
      <div v-if="universityDetail.departments" class="detail-section">
        <div class="section-title">院系设置</div>
        <markdown-renderer :content="universityDetail.departments" />
      </div>

      <!-- 专业介绍 -->
      <div v-if="universityDetail.majors" class="detail-section">
        <div class="section-title">专业介绍</div>
        <markdown-renderer :content="universityDetail.majors" />
      </div>

      <!-- 录取规则 -->
      <div v-if="universityDetail.admissionRules" class="detail-section">
        <div class="section-title">录取规则</div>
        <markdown-renderer :content="universityDetail.admissionRules" />
      </div>

      <!-- 奖学金设置 -->
      <div v-if="universityDetail.scholarships" class="detail-section">
        <div class="section-title">奖学金设置</div>
        <markdown-renderer :content="universityDetail.scholarships" />
      </div>

      <!-- 住宿条件 -->
      <div v-if="universityDetail.accommodation" class="detail-section">
        <div class="section-title">住宿条件</div>
        <markdown-renderer :content="universityDetail.accommodation" />
      </div>

      <!-- 联系方式 -->
      <div v-if="universityDetail.contactInfo" class="detail-section">
        <div class="section-title">联系方式</div>
        <markdown-renderer :content="universityDetail.contactInfo" />
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
          />
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
          />
        </div>
      </div>
      <div class="section-container">
        <div class="section-title">互动管理</div>
        <interaction-management
            :university-id="Number($route.params.id)"
            class="section-margin"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getUniversityDetail } from '@/api/university'
import AdmissionScores from '@/views/admin/university/components/AdmissionScores.vue'
import InteractionManagement from '@/views/admin/university/components/InteractionManagement.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default {
  name: 'UniversityDetail',
  components: {
    AdmissionScores,
    InteractionManagement,
    MarkdownRenderer
  },
  data() {
    return {
      loading: false,
      universityDetail: {
        // 设置详细的默认值
        name: '',
        province: '',
        address: '',
        adminDepartment: '',
        website: '',
        admissionWebsite: '',
        contactNumber: '',
        type: '',
        level: '',
        features: [],
        introduction: '',
        departments: '',
        majors: '',
        admissionRules: '',
        scholarships: '',
        accommodation: '',
        contactInfo: '',
        studentCount: null,
        teacherCount: null,
        libraryCount: null,
        campusArea: null,
        // 数组类型数据
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
    // 修改获取详情方法
    async getDetail() {
      this.loading = true
      try {
        const { data } = await getUniversityDetail(this.$route.params.id)
        // 处理可能为 null 的字段
        this.universityDetail = {
          ...this.universityDetail, // 保留默认值
          ...data,
          features: data.features || [],
          admissionScores: data.admissionScores || [],
          satisfactionRatings: data.satisfactionRatings || [],
          recommendationRatings: data.recommendationRatings || []
        }
      } catch (error) {
        console.error('获取高校详情失败:', error)
        this.$message.error('获取详情失败')
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

  .scale-card {
    text-align: center;
    margin-top: 20px;

    .scale-item {
      padding: 10px;

      .scale-value {
        font-size: 24px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 10px;
      }

      .scale-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }
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

.detail-section {
  margin-top: 30px;
  padding: 0 20px;
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

.el-rate__text {
  margin-left: 10px;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background-color: #f8fafc;
}

.clearfix::after {
  content: '';
  display: table;
  clear: both;
}

.el-descriptions {
  margin-bottom: 20px;
}

.consult-section {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
}

.section-container {
  margin-top: 30px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  .section-margin {
    margin-top: 15px;
  }
}

.interaction-management {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
</style>
