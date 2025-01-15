<!--src/views/user/university/consultation/index.vue-->
<template>
  <div class="consultation">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>院校咨询</span>
        <el-button style="float: right;" size="small" @click="goBack">返回</el-button>
      </div>

      <!-- 咨询统计 -->
      <div class="consultation-stats">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-value">{{ totalQuestions }}</div>
              <div class="stat-label">总提问数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-value">{{ repliedQuestions }}</div>
              <div class="stat-label">已回答数</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-value">{{ avgResponseTime }}小时</div>
              <div class="stat-label">平均回复时间</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 快速提问 -->
      <div class="quick-ask">
        <el-form :model="questionForm" :rules="rules" ref="questionForm" label-width="80px" class="ask-form">
          <el-form-item label="问题标题" prop="title">
            <el-input
              v-model="questionForm.title"
              placeholder="请简要描述您的问题(5-50字)"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="问题详情" prop="content">
            <el-input
              type="textarea"
              v-model="questionForm.content"
              :rows="4"
              placeholder="请详细描述您的问题(10-500字)"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitQuestion">提交问题</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 常见问题 -->
      <div class="faq-section">
        <div class="section-title">
          <span>常见问题</span>
        </div>
        <el-collapse v-model="activeNames">
          <el-collapse-item
            v-for="faq in faqs"
            :key="faq.id"
            :title="faq.question"
            :name="faq.id"
          >
            <div class="faq-answer">{{ faq.answer }}</div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 问答列表 -->
      <div class="qa-list">
        <div class="section-title">
          <span>全部问答</span>
          <div class="filter-group">
            <el-radio-group v-model="filter" size="small" @change="handleFilterChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="pending">待回复</el-radio-button>
              <el-radio-button label="replied">已回复</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="qa-items">
          <div v-for="qa in questionList" :key="qa.id" class="qa-item">
            <div class="question-header">
              <span class="question-title">{{ qa.title }}</span>
              <el-tag
                :type="qa.status === 'replied' ? 'success' : qa.status === 'pending' ? 'warning' : 'info'"
                size="small"
              >
                {{ qa.status === 'replied' ? '已回复' : qa.status === 'pending' ? '待回复' : '已关闭' }}
              </el-tag>
            </div>
            <div class="question-content">{{ qa.content }}</div>
            <div class="question-meta">
              <span class="asker">{{ qa.askerName }}</span>
              <span class="time">{{ qa.createTime }}</span>
              <span class="view-count">{{ qa.viewCount }}次浏览</span>
            </div>

            <div v-if="qa.reply" class="reply-section">
              <div class="reply-content">
                <i class="el-icon-chat-dot-square"></i>
                {{ qa.reply.content }}
              </div>
              <div class="reply-meta">
                <span class="replier">{{ qa.reply.replierName }}</span>
                <span class="time">{{ qa.reply.replyTime }}</span>
              </div>
            </div>
          </div>
        </div>

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
  name: 'UniversityConsultation',

  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      filter: 'all',
      activeNames: ['1'],
      questionForm: {
        title: '',
        content: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入问题标题', trigger: 'blur' },
          { min: 5, max: 50, message: '标题长度在 5 到 50 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请输入问题详情', trigger: 'blur' },
          { min: 10, max: 500, message: '详情长度在 10 到 500 个字符', trigger: 'blur' }
        ]
      },
      questionList: [],
      // 示例常见问题数据
      faqs: [
        {
          id: '1',
          question: '这所学校的住宿条件如何？',
          answer: '本校本科生宿舍均为4人间，配备空调、独立卫浴、网络接口等设施。研究生宿舍为2-3人间。校内设有多个食堂，提供多样化餐饮选择。'
        },
        {
          id: '2',
          question: '学校的奖学金设置情况？',
          answer: '学校设有国家奖学金、学业奖学金、专项奖学金等多种类型。其中国家奖学金金额为8000元/年，覆盖约5%的学生。学业奖学金分为一等、二等、三等，覆盖面约30%。'
        },
        {
          id: '3',
          question: '学校的就业情况如何？',
          answer: '近三年本科生就业率保持在95%以上，其中约30%的毕业生选择继续深造。主要就业领域包括IT、金融、教育等行业。'
        }
      ]
    }
  },

  computed: {
    ...mapState({
      consultations: state => state.university.consultations || []
    }),

    universityId() {
      return this.$route.params.id
    },

    totalQuestions() {
      return this.consultations.length || 0
    },

    repliedQuestions() {
      return this.consultations.filter(q => q.status === 'replied').length || 0
    },

    avgResponseTime() {
      // 计算平均回复时间（小时）
      const repliedQuestions = this.consultations.filter(q => q.status === 'replied')
      if (repliedQuestions.length === 0) return 0

      const totalHours = repliedQuestions.reduce((sum, q) => {
        const createTime = new Date(q.created_at)
        const replyTime = new Date(q.reply?.created_at)
        const hours = (replyTime - createTime) / (1000 * 60 * 60)
        return sum + hours
      }, 0)

      return Math.round(totalHours / repliedQuestions.length)
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
          this.$store.dispatch('university/getConsultations', this.universityId),
          this.fetchQuestionList()
        ])
      } catch (error) {
        console.error('获取咨询数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchQuestionList() {
      // TODO: 实现获取问答列表的接口
    },

    submitQuestion() {
      this.$refs.questionForm.validate(async valid => {
        if (valid) {
          try {
            await this.$store.dispatch('university/submitConsultation', {
              id: this.universityId,
              consultationData: {
                title: this.questionForm.title,
                content: this.questionForm.content,
                type: 'consult'
              }
            })
            this.$message.success('提交问题成功')
            this.questionForm.title = ''
            this.questionForm.content = ''
            this.$refs.questionForm.resetFields()
            this.fetchData()
          } catch (error) {
            console.error('提交问题失败:', error)
            this.$message.error('提交问题失败，请重试')
          }
        }
      })
    },

    handleFilterChange(value) {
      this.currentPage = 1
      this.fetchQuestionList()
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchQuestionList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchQuestionList()
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
.consultation {
  padding: 20px;

  .consultation-stats {
    margin-bottom: 30px;

    .stat-card {
      background: #f5f7fa;
      padding: 20px;
      text-align: center;
      border-radius: 4px;

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }
    }
  }

  .quick-ask {
    margin-bottom: 30px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;

    .ask-form {
      max-width: 800px;
      margin: 0 auto;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-group {
      margin-right: 10px;
    }
  }

  .faq-section {
    margin-bottom: 30px;

    .faq-answer {
      color: #666;
      line-height: 1.6;
    }
  }

  .qa-list {
    .qa-items {
      .qa-item {
        padding: 20px;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;

          .question-title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
          }
        }

        .question-content {
          color: #666;
          margin-bottom: 10px;
          line-height: 1.6;
        }

        .question-meta {
          color: #999;
          font-size: 12px;

          > span {
            margin-right: 20px;
          }
        }

        .reply-section {
          margin-top: 15px;
          padding: 15px;
          background: #f5f7fa;
          border-radius: 4px;

          .reply-content {
            color: #666;
            line-height: 1.6;
            margin-bottom: 10px;

            i {
              color: #409EFF;
              margin-right: 5px;
            }
          }

          .reply-meta {
            color: #999;
            font-size: 12px;

            > span {
              margin-right: 20px;
            }
          }
        }
      }
    }
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }
}
</style>
