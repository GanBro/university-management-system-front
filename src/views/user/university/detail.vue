<template>
  <div class="university-detail" v-loading="loading">
    <!-- 头部区域 -->
    <div class="header-bg">
      <div class="header-content">
        <div class="basic-info">
          <!-- Logo区域 -->
          <div class="logo-wrapper">
            <img
                v-if="universityData.logo"
                :src="getLogoUrl(universityData.logo)"
                :alt="universityData.name + '的logo'"
                class="university-logo"
                @error="handleLogoError"
            >
            <div v-else class="logo-placeholder">
              <span>{{ universityData.name ? universityData.name.substring(0, 2) : 'N/A' }}</span>
            </div>
          </div>

          <!-- 基本信息区域 -->
          <div class="info-content">
            <h1 class="university-name">{{ universityData.name }}</h1>
            <div class="tags-wrapper">
              <el-tag size="small">{{ universityData.province }}</el-tag>
              <el-tag size="small" type="warning">{{ universityData.adminDepartment }}</el-tag>
              <el-tag size="small" type="success">{{ universityData.level }}</el-tag>
              <el-tag size="small" type="info">{{ universityData.type }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-content">
      <!-- 快速信息卡片 -->
      <div class="info-cards">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover" class="info-card">
              <div class="card-content">
                <i class="el-icon-location"></i>
                <div class="text-content">
                  <div class="label">地址</div>
                  <div class="value">{{ universityData.address || '暂无地址信息' }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="info-card">
              <div class="card-content">
                <i class="el-icon-link"></i>
                <div class="text-content">
                  <div class="label">官网</div>
                  <a :href="universityData.website" target="_blank" class="value link">{{ universityData.website }}</a>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="info-card">
              <div class="card-content">
                <i class="el-icon-phone"></i>
                <div class="text-content">
                  <div class="label">联系电话</div>
                  <div class="value">{{ universityData.contactNumber || '暂无联系方式' }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 内容标签页 -->
      <el-card class="content-card">
        <el-tabs v-model="activeTab">
          <!-- 首页标签 -->
          <el-tab-pane label="首页" name="home">
            <el-row :gutter="20">
              <!-- 左侧评分区域 -->
              <el-col :span="16">
                <!-- 院校满意度 -->
                <satisfaction-card
                    :satisfaction-ratings="satisfactionRatings"
                    @more="handleMoreSatisfaction"
                />

                <!-- 专业满意度 -->
                <major-satisfaction-card
                    :major-satisfaction="majorSatisfaction"
                    @more="handleMoreMajorSatisfaction"
                />

                <!-- 专业推荐人数 -->
                <recommendation-count-card
                    :recommendation-counts="recommendationCounts"
                    @more="handleMoreRecommendations"
                />

                <!-- 专业推荐指数 -->
                <recommendation-index-card
                    :recommendation-index="recommendationIndex"
                    @more="handleMoreRecommendationIndex"
                />
              </el-col>

              <!-- 右侧咨询区域 -->
              <el-col :span="8">
                <consultation-card
                    :university-id="universityId"
                    :consultations="consultations"
                    @questionClick="handleQuestionClick"
                    @ask="handleAsk"
                />
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane label="学校简介" name="introduction">
            <div v-if="universityData.introduction">
              <markdown-renderer :content="universityData.introduction" />
            </div>
            <div v-else class="empty-text">暂无简介信息</div>
          </el-tab-pane>

          <el-tab-pane label="院系设置" name="departments">
            <div v-if="universityData.departments">
              <markdown-renderer :content="universityData.departments" />
            </div>
            <div v-else class="empty-text">暂无院系信息</div>
          </el-tab-pane>

          <el-tab-pane label="专业介绍" name="majors">
            <div v-if="universityData.majors">
              <markdown-renderer :content="universityData.majors" />
            </div>
            <div v-else class="empty-text">暂无专业信息</div>
          </el-tab-pane>

          <el-tab-pane label="录取规则" name="admissionRules">
            <div v-if="universityData.admissionRules">
              <markdown-renderer :content="universityData.admissionRules" />
            </div>
            <div v-else class="empty-text">暂无录取规则信息</div>
          </el-tab-pane>

          <el-tab-pane label="奖学金设置" name="scholarships">
            <div v-if="universityData.scholarships">
              <markdown-renderer :content="universityData.scholarships" />
            </div>
            <div v-else class="empty-text">暂无奖学金信息</div>
          </el-tab-pane>

          <el-tab-pane label="食宿条件" name="accommodation">
            <div v-if="universityData.accommodation">
              <markdown-renderer :content="universityData.accommodation" />
            </div>
            <div v-else class="empty-text">暂无食宿信息</div>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 统计数据 -->
      <el-row :gutter="20" class="statistics-cards">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <i class="el-icon-user"></i>
              <div class="stat-info">
                <div class="label">在校生数量</div>
                <div class="value">{{ formatNumber(universityData.studentCount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <i class="el-icon-s-custom"></i>
              <div class="stat-info">
                <div class="label">教师数量</div>
                <div class="value">{{ formatNumber(universityData.teacherCount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <i class="el-icon-reading"></i>
              <div class="stat-info">
                <div class="label">图书馆藏书量</div>
                <div class="value">{{ formatNumber(universityData.libraryCount) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <i class="el-icon-office-building"></i>
              <div class="stat-info">
                <div class="label">校园面积（平方米）</div>
                <div class="value">{{ formatNumber(universityData.campusArea) }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import defaultLogo from '@/assets/404_images/404.png'
import SatisfactionCard from '../components/SatisfactionCard'
import MajorSatisfactionCard from '../components/MajorSatisfactionCard'
import RecommendationCountCard from '../components/RecommendationCountCard'
import RecommendationIndexCard from '../components/RecommendationIndexCard'
import ConsultationCard from '../components/ConsultationCard'

export default {
  name: 'UniversityDetail',

  components: {
    MarkdownRenderer,
    SatisfactionCard,
    MajorSatisfactionCard,
    RecommendationCountCard,
    RecommendationIndexCard,
    ConsultationCard
  },

  data() {
    return {
      loading: false,
      activeTab: 'home'
    }
  },

  computed: {
    ...mapState({
      universityData: state => state.university.currentUniversity || {},
      satisfactionData: state => state.university.satisfactionData || {},
      majorSatisfaction: state => state.university.majorSatisfaction || [],
      recommendations: state => state.university.recommendations || {},
      consultations: state => state.university.consultations || []
    }),

    universityId() {
      return this.$route.params.id
    },

    // 处理满意度数据
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
    },

    recommendationCounts() {
      return this.recommendations.counts || []
    },

    recommendationIndex() {
      return this.recommendations.index || []
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        await this.$store.dispatch('university/getDetail', this.universityId)

        // 获取满意度等相关数据
        await Promise.all([
          this.$store.dispatch('university/getSatisfactionData', this.universityId),
          this.$store.dispatch('university/getMajorSatisfaction', this.universityId),
          this.$store.dispatch('university/getRecommendations', this.universityId),
          this.$store.dispatch('university/getConsultations', this.universityId)
        ])
      } catch (error) {
        console.error('获取大学详情失败:', error)
        this.$message.error('获取大学详情失败')
      } finally {
        this.loading = false
      }
    },

    getLogoUrl(logo) {
      if (!logo) return defaultLogo
      if (logo.startsWith('http')) return logo
      return process.env.VUE_APP_BASE_API + logo
    },

    handleLogoError(event) {
      event.target.src = defaultLogo
    },

    formatNumber(num) {
      return num ? num.toLocaleString() : '暂无数据'
    },

    getRatingColor(rating) {
      if (rating >= 4.5) return '#10b981'  // 绿色
      if (rating >= 4.0) return '#3b82f6'  // 蓝色
      return '#f59e0b'  // 橙色
    },

    // 查看更多相关方法
    handleMoreSatisfaction() {
      this.$router.push({
        name: 'UserUniversitySatisfaction',
        params: { id: this.universityId }
      })
    },

    handleMoreMajorSatisfaction() {
      this.$router.push({
        name: 'UserUniversityMajorSatisfaction',
        params: { id: this.universityId }
      })
    },

    handleMoreRecommendations() {
      this.$router.push({
        name: 'UserUniversityRecommendations',
        params: { id: this.universityId }
      })
    },

    handleMoreRecommendationIndex() {
      this.$router.push({
        name: 'UserUniversityRecommendationIndex',
        params: { id: this.universityId }
      })
    },

    handleQuestionClick(question) {
      console.log('跳转到咨询详情:', {
        questionId: question.id,
        universityId: this.universityId
      })

      this.$router.push({
        path: `/user/consultation/${question.id}`,
        query: {
          universityId: this.universityId // 使用 query 传递大学 ID
        }
      }).catch(err => {
        console.error('路由跳转失败:', err)
      })
    },

    async handleAsk(consultationData) {
      try {
        await this.$store.dispatch('university/submitConsultation', {
          id: this.universityId,
          consultationData
        })
        this.$message.success('提交咨询成功')
      } catch (error) {
        console.error('提交咨询失败:', error)
        this.$message.error('提交咨询失败，请重试')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.university-detail {
  .header-bg {
    height: 200px;
    background-color: #10b981;
    padding: 20px;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;

      .basic-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .logo-wrapper {
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          .university-logo {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }

          .logo-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f3f4f6;

            span {
              font-size: 32px;
              font-weight: bold;
              color: #6b7280;
            }
          }
        }

        .info-content {
          .university-name {
            color: white;
            font-size: 24px;
            margin-bottom: 12px;
          }

          .tags-wrapper {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;

            .el-tag {
              border-radius: 12px;
            }
          }
        }
      }
    }
  }

  .main-content {
    max-width: 1200px;
    margin: -40px auto 0;
    padding: 0 20px 40px;
    position: relative;

    .info-cards {
      margin-bottom: 20px;

      .info-card {
        .card-content {
          display: flex;
          align-items: center;
          gap: 12px;

          i {
            font-size: 24px;
            color: #10b981;
          }

          .text-content {
            .label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 4px;
            }

            .value {
              color: #374151;
              word-break: break-all;

              &.link {
                color: #2563eb;
                text-decoration: none;

                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
    }

    .content-card {
      margin-bottom: 20px;

      .empty-text {
        color: #6b7280;
        text-align: center;
        padding: 40px;
      }

      ::v-deep .el-tabs__nav-wrap {
        padding: 0 20px;
      }

      ::v-deep .el-tabs__item {
        font-size: 16px;
        padding: 0 20px;
        height: 50px;
        line-height: 50px;
      }

      ::v-deep .el-tab-pane {
        padding: 20px;
      }
    }

    .statistics-cards {
      .stat-card {
        .stat-content {
          display: flex;
          align-items: center;
          gap: 12px;

          i {
            font-size: 32px;
            color: #10b981;
          }

          .stat-info {
            .label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 4px;
            }

            .value {
              font-size: 18px;
              font-weight: bold;
              color: #374151;
            }
          }
        }
      }
    }
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .university-detail {
    .header-bg {
      height: auto;
      padding: 16px;

      .header-content {
        .basic-info {
          flex-direction: column;
          text-align: center;

          .logo-wrapper {
            width: 100px;
            height: 100px;
          }

          .info-content {
            .university-name {
              font-size: 20px;
            }

            .tags-wrapper {
              justify-content: center;
            }
          }
        }
      }
    }

    .main-content {
      margin-top: -20px;
      padding: 0 16px 20px;

      .info-cards {
        .el-col {
          margin-bottom: 16px;
        }
      }

      .content-card {
        ::v-deep .el-tabs__item {
          font-size: 14px;
          padding: 0 12px;
        }
      }

      .statistics-cards {
        .el-col {
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>
