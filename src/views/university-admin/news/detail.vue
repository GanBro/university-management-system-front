<!--src/views/university-admin/news/detail.vue-->
<template>
  <div class="app-container">
    <div class="detail-container" v-loading="loading">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button icon="el-icon-back" @click="goBack">返回列表</el-button>
      </div>

      <!-- 文章头部信息 -->
      <div class="article-header">
        <h1 class="article-title">{{ newsData.title }}</h1>
        <div class="article-meta">
          <el-tag size="small" :type="getNewsTypeTag(newsData.type)">
            {{ getNewsTypeText(newsData.type) }}
          </el-tag>
          <span class="meta-item">
            <i class="el-icon-user"></i>
            作者：{{ newsData.author }}
          </span>
          <span class="meta-item">
            <i class="el-icon-view"></i>
            浏览量：{{ newsData.viewCount }}
          </span>
          <span class="meta-item">
            <i class="el-icon-time"></i>
            发布时间：{{ formatDateTime(newsData.publishTime) }}
          </span>
          <el-tag size="small" :type="newsData.status === 1 ? 'success' : 'info'">
            {{ newsData.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </div>
      </div>

      <!-- 文章内容 -->
      <el-card class="article-content">
        <div class="markdown-body" v-html="renderedContent"></div>
      </el-card>

      <!-- 操作按钮 -->
      <div class="article-actions">
        <el-button type="primary" icon="el-icon-edit" @click="handleEdit">
          编辑文章
        </el-button>
        <el-button
          v-if="newsData.status === 0"
          type="success"
          icon="el-icon-upload2"
          @click="handlePublish"
        >
          发布文章
        </el-button>
        <el-button type="danger" icon="el-icon-delete" @click="handleDelete">
          删除文章
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import MarkdownIt from 'markdown-it'
import dayjs from 'dayjs'

export default {
  name: 'UniversityAdminNewsDetail',

  data() {
    return {
      loading: true,
      newsData: {},
      markdownIt: new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
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

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        // 模拟数据
        this.newsData = {
          id: this.$route.params.id,
          title: '北京大学2025年本科招生简章发布',
          type: 'notice',
          content: '# 北京大学2025年本科招生简章\n\n## 一、招生计划\n\n2025年，北京大学计划招收本科生约4000人，其中包括普通类、特长类、国防生等各类招生计划。\n\n## 二、报名条件\n\n符合2025年高考报名条件，德智体美劳全面发展，综合素质优良的高中毕业生。\n\n## 三、录取政策\n\n1. 按照"分数优先、遵循志愿"的原则录取。\n2. 实行大类招生，入学后按照学校规定进行分流。\n\n## 四、联系方式\n\n招生办公室电话：010-12345678\n招生网站：https://admission.pku.edu.cn',
          status: 1,
          author: '招生办',
          viewCount: 3245,
          publishTime: '2025-03-24 10:30:00',
          universityId: 1
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        this.$message.error('获取新闻详情失败')
      } finally {
        this.loading = false
      }
    },

    formatDateTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
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
      this.$router.push('/university-admin/news/list')
    },

    handleEdit() {
      this.$router.push(`/university-admin/news/edit/${this.newsData.id}`)
    },

    async handlePublish() {
      try {
        await this.$confirm('确认发布该文章?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        this.$message.success('发布成功')
        this.newsData.status = 1
        this.newsData.publishTime = new Date().toISOString()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('发布失败:', error)
          this.$message.error('发布失败')
        }
      }
    },

    async handleDelete() {
      try {
        await this.$confirm('确认删除该文章?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        this.$message.success('删除成功')
        this.goBack()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;

  .back-button {
    margin-bottom: 20px;
  }

  .article-header {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ebeef5;

    .article-title {
      font-size: 24px;
      font-weight: bold;
      color: #303133;
      margin: 0 0 16px 0;
    }

    .article-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      color: #909399;
      font-size: 14px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;

        i {
          font-size: 16px;
        }
      }

      .el-tag {
        margin-right: 8px;
      }
    }
  }

  .article-content {
    margin-bottom: 24px;
    min-height: 300px;

    .markdown-body {
      padding: 20px;
      font-size: 16px;
      line-height: 1.8;
      color: #2c3e50;

      ::v-deep {
        h1, h2, h3, h4, h5, h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }

        p {
          margin-bottom: 16px;
        }

        img {
          max-width: 100%;
          margin: 16px 0;
        }

        code {
          padding: 0.2em 0.4em;
          margin: 0;
          font-size: 85%;
          background-color: rgba(27,31,35,0.05);
          border-radius: 3px;
        }

        pre {
          padding: 16px;
          overflow: auto;
          font-size: 85%;
          line-height: 1.45;
          background-color: #f6f8fa;
          border-radius: 3px;
        }
      }
    }
  }

  .article-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}
</style>
