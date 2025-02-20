<template>
  <div class="news-detail-page">
    <div class="news-detail-container" v-loading="loading">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button type="text" icon="el-icon-arrow-left" @click="goBack">返回列表</el-button>
      </div>

      <!-- 文章内容 -->
      <el-card class="news-card" shadow="never">
        <!-- 文章标题 -->
        <div class="news-header">
          <div class="news-category">
            <el-tag size="medium" :type="getNewsTypeTag(newsData.type)" effect="plain">
              {{ getNewsTypeText(newsData.type) }}
            </el-tag>
          </div>
          <h1 class="news-title">{{ newsData.title }}</h1>
        </div>

        <!-- 文章元信息 -->
        <div class="news-meta">
          <div class="meta-left">
            <span class="meta-item university">
              <i class="el-icon-school"></i>
              {{ newsData.university ? newsData.university.name : '未关联学校' }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <i class="el-icon-user"></i>
              {{ newsData.author }}
            </span>
          </div>
          <div class="meta-right">
            <span class="meta-item">
              <i class="el-icon-view"></i>
              {{ newsData.viewCount }} 次浏览
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item">
              <i class="el-icon-time"></i>
              {{ formatDateTime(newsData.publishTime) }}
            </span>
          </div>
        </div>

        <!-- 文章内容 -->
        <div class="news-content markdown-body" v-html="renderedContent"></div>

        <!-- 文章底部 -->
        <div class="news-footer">
          <div class="share-buttons">
            <el-button type="text" icon="el-icon-share">分享</el-button>
            <el-button type="text" icon="el-icon-printer">打印</el-button>
          </div>
          <div class="copyright">
            <p>© {{ new Date().getFullYear() }} {{ newsData.university ? newsData.university.name : '高校管理系统' }}. 保留所有权利</p>
          </div>
        </div>
      </el-card>

      <!-- 相关推荐 -->
      <el-card class="related-news" shadow="never" v-if="relatedNews.length > 0">
        <div slot="header" class="related-header">
          <span>相关推荐</span>
        </div>
        <div class="related-list">
          <div v-for="item in relatedNews" :key="item.id" class="related-item" @click="handleRelatedClick(item)">
            <span class="related-title">{{ item.title }}</span>
            <span class="related-date">{{ formatDate(item.publishTime) }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getNewsDetail } from '@/api/news'
import MarkdownIt from 'markdown-it'
import dayjs from 'dayjs'

export default {
  name: 'UserNewsDetail',
  
  data() {
    return {
      loading: true,
      newsData: {},
      relatedNews: [], // 相关新闻列表
      markdownIt: new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        breaks: true
      })
    }
  },

  computed: {
    renderedContent() {
      return this.newsData.content 
        ? this.markdownIt.render(this.newsData.content)
        : ''
    }
  },

  created() {
    this.fetchNewsDetail()
  },

  methods: {
    async fetchNewsDetail() {
      try {
        this.loading = true
        const { data } = await getNewsDetail(this.$route.params.id)
        this.newsData = data
        // TODO: 获取相关新闻列表
        this.relatedNews = [] // 这里需要实现获取相关新闻的逻辑
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        this.$message.error('获取新闻详情失败')
      } finally {
        this.loading = false
      }
    },

    formatDateTime(time) {
      return time ? dayjs(time).format('YYYY年MM月DD日 HH:mm') : '-'
    },

    formatDate(time) {
      return time ? dayjs(time).format('YYYY-MM-DD') : '-'
    },

    getNewsTypeTag(type) {
      const typeMap = {
        news: 'primary',
        notice: 'success',
        policy: 'info',
        faq: 'warning',
        consult: ''
      }
      return typeMap[type] || ''
    },

    getNewsTypeText(type) {
      const typeMap = {
        news: '新闻动态',
        notice: '通知公告',
        policy: '政策文件',
        faq: '常见问题',
        consult: '招生咨询'
      }
      return typeMap[type] || type
    },

    goBack() {
      this.$router.go(-1)
    },

    handleRelatedClick(news) {
      this.$router.push(`/user/news/${news.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.news-detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px 0;

  .news-detail-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;

    .back-button {
      margin-bottom: 20px;
      .el-button {
        padding-left: 0;
        font-size: 16px;
        &:hover {
          color: #409EFF;
        }
      }
    }

    .news-card {
      margin-bottom: 20px;
      border-radius: 8px;
      background: #fff;

      .news-header {
        text-align: center;
        margin-bottom: 30px;

        .news-category {
          margin-bottom: 20px;
          .el-tag {
            font-size: 14px;
            padding: 6px 16px;
            border-radius: 16px;
          }
        }

        .news-title {
          font-size: 32px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
          line-height: 1.4;
        }
      }

      .news-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        margin-bottom: 30px;
        border-top: 1px solid #ebeef5;
        border-bottom: 1px solid #ebeef5;
        color: #606266;
        font-size: 14px;

        .meta-left, .meta-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;

          &.university {
            color: #409EFF;
          }

          i {
            font-size: 16px;
          }
        }

        .meta-divider {
          color: #dcdfe6;
        }
      }

      .news-content {
        font-size: 16px;
        line-height: 1.8;
        color: #2c3e50;
        padding: 0 20px;

        ::v-deep {
          h1, h2, h3, h4, h5, h6 {
            margin: 24px 0 16px;
            font-weight: 600;
            line-height: 1.4;
          }

          h1 { font-size: 28px; }
          h2 { font-size: 24px; }
          h3 { font-size: 20px; }
          h4 { font-size: 18px; }
          h5 { font-size: 16px; }
          h6 { font-size: 14px; }

          p {
            margin-bottom: 16px;
            line-height: 1.8;
          }

          img {
            max-width: 100%;
            height: auto;
            margin: 24px auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          blockquote {
            margin: 16px 0;
            padding: 16px 24px;
            background-color: #f8f9fa;
            border-left: 4px solid #409EFF;
            border-radius: 4px;
            color: #606266;
            font-style: italic;
          }

          code {
            background-color: #f6f8fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', Courier, monospace;
          }

          pre {
            background-color: #282c34;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            
            code {
              background: none;
              color: #abb2bf;
            }
          }
        }
      }

      .news-footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #ebeef5;

        .share-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;

          .el-button {
            font-size: 16px;
            &:hover {
              color: #409EFF;
            }
          }
        }

        .copyright {
          text-align: center;
          color: #909399;
          font-size: 14px;
        }
      }
    }

    .related-news {
      border-radius: 8px;

      .related-header {
        font-size: 18px;
        font-weight: 600;
        color: #2c3e50;
      }

      .related-list {
        .related-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          cursor: pointer;
          border-bottom: 1px solid #ebeef5;

          &:last-child {
            border-bottom: none;
          }

          &:hover {
            .related-title {
              color: #409EFF;
            }
          }

          .related-title {
            flex: 1;
            font-size: 14px;
            color: #303133;
            margin-right: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s;
          }

          .related-date {
            color: #909399;
            font-size: 13px;
          }
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .news-detail-page {
    padding: 10px 0;

    .news-detail-container {
      padding: 0 15px;

      .news-card {
        .news-header {
          .news-title {
            font-size: 24px;
          }
        }

        .news-meta {
          flex-direction: column;
          gap: 10px;

          .meta-left, .meta-right {
            width: 100%;
            justify-content: center;
          }
        }

        .news-content {
          padding: 0 10px;
          font-size: 15px;
        }
      }
    }
  }
}
</style> 