<!--src/views/university-admin/news/form.vue-->
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '编辑新闻' : '发布新闻' }}</span>
      </div>

      <el-form ref="form" :model="formData" :rules="rules" label-width="120px">
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

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">保存为草稿</el-radio>
            <el-radio :label="1">立即发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            {{ isEdit ? '更新' : '提交' }}
          </el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import MarkdownEditor from '@/components/Markdown/editor/index.vue'

export default {
  name: 'UniversityAdminNewsForm',
  components: {
    MarkdownEditor
  },
  data() {
    return {
      isEdit: false,
      loading: false,
      submitLoading: false,
      formData: {
        title: '',
        type: 'news',
        content: '',
        author: '',
        status: 0,
        universityId: 1 // 假设当前管理员所属的高校 ID 为 1
      },
      typeOptions: [
        { label: '新闻动态', value: 'news' },
        { label: '通知公告', value: 'notice' },
        { label: '政策文件', value: 'policy' },
        { label: '常见问题', value: 'faq' },
        { label: '招生咨询', value: 'consult' }
      ],
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  created() {
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
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 500))

        // 模拟数据
        const newsData = {
          id: id,
          title: '北京大学2025年本科招生简章发布',
          type: 'notice',
          content: '# 北京大学2025年本科招生简章\n\n## 一、招生计划\n\n2025年，北京大学计划招收本科生约4000人，其中包括普通类、特长类、国防生等各类招生计划。\n\n## 二、报名条件\n\n符合2025年高考报名条件，德智体美劳全面发展，综合素质优良的高中毕业生。\n\n## 三、录取政策\n\n1. 按照"分数优先、遵循志愿"的原则录取。\n2. 实行大类招生，入学后按照学校规定进行分流。\n\n## 四、联系方式\n\n招生办公室电话：010-12345678\n招生网站：https://admission.pku.edu.cn',
          status: 0,
          author: '招生办',
          universityId: 1
        }

        this.formData = {
          ...this.formData,
          ...newsData
        }
      } catch (error) {
        console.error('Failed to get news detail:', error)
        this.$message.error('获取新闻失败')
      } finally {
        this.loading = false
      }
    },

    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true

        // 设置作者（这里简单使用硬编码，实际应该从登录信息获取）
        this.formData.author = this.formData.author || '北大管理员'

        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 800))

        this.$message.success(this.isEdit ? '更新成功' : '提交成功')
        this.$router.push('/university-admin/news/list')
      } catch (error) {
        console.error('Failed to submit form:', error)
        this.$message.error(error.message || '提交失败')
      } finally {
        this.submitLoading = false
      }
    },

    cancel() {
      this.$router.push('/university-admin/news/list')
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
}
</style>
