<!--# src/views/user/university/consultation/detail.vue-->
<template>
  <div class="consultation-detail">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>咨询详情</span>
        <el-button style="float: right;" size="small" @click="goBack">返回</el-button>
      </div>

      <!-- 问题详情 -->
      <div class="question-section">
        <div class="question-header">
          <h2 class="title">{{ questionDetail.title }}</h2>
          <el-tag
            :type="questionDetail.status === 'replied' ? 'success' : questionDetail.status === 'pending' ? 'warning' : 'info'"
          >
            {{ questionDetail.status === 'replied' ? '已回复' : questionDetail.status === 'pending' ? '待回复' : '已关闭' }}
          </el-tag>
        </div>

        <div class="question-meta">
          <span class="asker">
            <i class="el-icon-user"></i>
            {{ questionDetail.askerName }}
          </span>
          <span class="time">
            <i class="el-icon-time"></i>
            {{ questionDetail.createTime }}
          </span>
          <span class="view-count">
            <i class="el-icon-view"></i>
            {{ questionDetail.viewCount }}次浏览
          </span>
        </div>

        <div class="question-content">{{ questionDetail.content }}</div>
      </div>

      <!-- 回复列表 -->
      <div class="reply-section">
        <div class="section-title">全部回复 ({{ replyList.length }})</div>

        <div class="reply-list">
          <div v-for="reply in replyList" :key="reply.id" class="reply-item">
            <div class="reply-user">
              <el-avatar :size="40" :src="reply.avatar">
                {{ reply.replierName.substring(0, 1) }}
              </el-avatar>
              <div class="user-info">
                <div class="name">
                  {{ reply.replierName }}
                  <el-tag size="mini" type="success" v-if="reply.isOfficial">官方回复</el-tag>
                </div>
                <div class="time">{{ reply.replyTime }}</div>
              </div>
            </div>

            <div class="reply-content">{{ reply.content }}</div>
          </div>
        </div>

        <!-- 回复表单 -->
        <div class="reply-form" v-if="questionDetail.status !== 'closed'">
          <el-form :model="replyForm" :rules="rules" ref="replyForm">
            <el-form-item prop="content">
              <el-input
                type="textarea"
                v-model="replyForm.content"
                :rows="4"
                placeholder="请输入回复内容"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitReply">提交回复</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 相关咨询 -->
      <div class="related-section">
        <div class="section-title">相关咨询</div>
        <div class="related-list">
          <div v-for="item in relatedQuestions" :key="item.id" class="related-item" @click="goToDetail(item.id)">
            <span class="title">{{ item.title }}</span>
            <span class="time">{{ item.createTime }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ConsultationDetail',

  data() {
    return {
      loading: false,
      questionDetail: {
        id: null,
        title: '',
        content: '',
        status: 'pending',
        askerName: '',
        createTime: '',
        viewCount: 0
      },
      replyList: [],
      relatedQuestions: [],
      replyForm: {
        content: ''
      },
      rules: {
        content: [
          { required: true, message: '请输入回复内容', trigger: 'blur' },
          { min: 5, max: 500, message: '回复内容长度在 5 到 500 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    questionId() {
      return this.$route.params.questionId
    },
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
          this.fetchQuestionDetail(),
          this.fetchReplyList(),
          this.fetchRelatedQuestions()
        ])
      } catch (error) {
        console.error('获取咨询详情失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchQuestionDetail() {
      try {
        const response = await this.$store.dispatch('interaction/getQuestionDetail', {
          universityId: this.universityId,
          questionId: this.questionId
        })
        this.questionDetail = response.data
      } catch (error) {
        console.error('获取问题详情失败:', error)
        throw error
      }
    },

    async fetchReplyList() {
      try {
        const response = await this.$store.dispatch('interaction/getReplyList', {
          universityId: this.universityId,
          questionId: this.questionId
        })
        this.replyList = response.data
      } catch (error) {
        console.error('获取回复列表失败:', error)
        throw error
      }
    },

    async fetchRelatedQuestions() {
      try {
        const response = await this.$store.dispatch('interaction/getRelatedQuestions', {
          universityId: this.universityId,
          questionId: this.questionId
        })
        this.relatedQuestions = response.data
      } catch (error) {
        console.error('获取相关咨询失败:', error)
        throw error
      }
    },

    submitReply() {
      this.$refs.replyForm.validate(async valid => {
        if (valid) {
          try {
            await this.$store.dispatch('interaction/submitReply', {
              universityId: this.universityId,
              questionId: this.questionId,
              content: this.replyForm.content
            })
            this.$message.success('回复成功')
            this.replyForm.content = ''
            this.fetchData()
          } catch (error) {
            console.error('提交回复失败:', error)
            this.$message.error('提交回复失败，请重试')
          }
        }
      })
    },

    goToDetail(questionId) {
      this.$router.push({
        name: 'UserConsultationDetail',
        params: {
          id: this.universityId, // 传递 universityId
          questionId: questionId // 传递 questionId
        }
      });
    },

    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.consultation-detail {
  padding: 20px;

  .question-section {
    margin-bottom: 30px;

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .title {
        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin: 0;
      }
    }

    .question-meta {
      margin-bottom: 15px;
      color: #999;
      font-size: 14px;

      > span {
        margin-right: 20px;

        i {
          margin-right: 5px;
        }
      }
    }

    .question-content {
      color: #666;
      line-height: 1.6;
      font-size: 16px;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
  }

  .reply-section {
    margin-bottom: 30px;

    .reply-list {
      .reply-item {
        padding: 20px;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .reply-user {
          display: flex;
          align-items: center;
          margin-bottom: 15px;

          .user-info {
            margin-left: 10px;

            .name {
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;

              .el-tag {
                margin-left: 8px;
              }
            }

            .time {
              font-size: 12px;
              color: #999;
            }
          }
        }

        .reply-content {
          color: #666;
          line-height: 1.6;
        }
      }
    }

    .reply-form {
      margin-top: 20px;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 4px;
    }
  }

  .related-section {
    .related-list {
      .related-item {
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          color: #409EFF;
        }

        .title {
          color: #333;
          flex: 1;
          margin-right: 20px;
        }

        .time {
          color: #999;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
