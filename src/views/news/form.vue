// src/views/news/form.vue
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '编辑信息' : '发布信息' }}</span>
      </div>

      <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="关联学校" prop="universityId">
          <el-select
            v-model="formData.universityId"
            filterable
            placeholder="请选择关联的学校"
            style="width: 100%"
          >
            <el-option
              v-for="item in universities"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <markdown-editor v-model="formData.content" height="400px" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            {{ isEdit ? '更新' : '发布' }}
          </el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import MarkdownEditor from '@/components/Markdown/editor'
import { getNewsDetail, createNews, updateNews } from '@/api/news'
import { getUniversityList } from '@/api/university'

export default {
  name: 'NewsForm',
  components: {
    MarkdownEditor
  },
  data() {
    return {
      isEdit: false,
      loading: false,
      submitLoading: false,
      universities: [], // 学校列表
      formData: {
        title: '',
        type: 'news',
        content: '',
        author: '',
        status: 0,
        universityId: undefined // 关联的学校ID
      },
      typeOptions: [
        { label: '新闻动态', value: 'news' },
        { label: '通知公告', value: 'notice' },
        { label: '政策文件', value: 'policy' },
        { label: '常见问题', value: 'faq' },
        { label: '招生咨询', value: 'consult' }
      ],
      rules: {
        universityId: [{ required: true, message: '请选择关联的学校', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  async created() {
    // 获取学校列表
    try {
      const { data } = await getUniversityList({ limit: 1000 })
      this.universities = data.records || []
    } catch (error) {
      console.error('Failed to get universities:', error)
      this.$message.error('获取学校列表失败')
    }

    // 获取详情（如果是编辑模式）
    const id = this.$route.params.id
    if (id && !isNaN(parseInt(id))) {
      this.isEdit = true
      this.getDetail(parseInt(id))
    }
  },
  methods: {
    async getDetail(id) {
      if (!id) return

      this.loading = true
      try {
        const { data } = await getNewsDetail(id)
        this.formData = {
          ...this.formData,
          ...data
        }
      } catch (error) {
        console.error('Failed to get news detail:', error)
        this.$message.error('获取信息失败')
      } finally {
        this.loading = false
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true

        // 设置作者（从用户信息中获取）
        const userInfo = this.$store.getters.userInfo
        this.formData.author = userInfo ? userInfo.username : '未知用户'

        const id = this.$route.params.id
        if (this.isEdit && id) {
          await updateNews(id, this.formData)
          this.$message.success('更新成功')
        } else {
          await createNews(this.formData)
          this.$message.success('发布成功')
        }
        this.$router.push('/news/list')
      } catch (error) {
        console.error('Failed to submit form:', error)
        this.$message.error(error.message || '提交失败')
      } finally {
        this.submitLoading = false
      }
    },
    cancel() {
      this.$router.push('/news/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .el-card {
    margin-bottom: 20px;
  }

  .markdown-editor {
    min-height: 400px;
  }
}
</style>
