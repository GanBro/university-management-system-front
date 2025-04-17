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
import { mapState, mapActions } from 'vuex'

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
        universityId: undefined // 将从store中获取
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
  computed: {
    ...mapState({
      currentNews: state => state.news.currentNews,
      detailLoading: state => state.news.detailLoading
    }),
    universityId() {
      // 获取当前高校管理员的高校ID
      return this.$store.getters.universityId || 1
    }
  },
  created() {
    // 设置高校ID
    this.formData.universityId = this.universityId

    // 判断是创建还是编辑
    const id = this.$route.params.id
    if (id && !isNaN(parseInt(id))) {
      this.isEdit = true
      this.getDetail(parseInt(id))
    }
  },
  methods: {
    ...mapActions({
      fetchNewsDetail: 'news/getDetail',
      createNewsAction: 'news/createNews',
      updateNewsAction: 'news/updateNews'
    }),

    async getDetail(id) {
      if (!id) return

      this.loading = true
      try {
        await this.fetchNewsDetail(id)

        // 如果获取到数据，填充表单
        if (this.currentNews) {
          this.formData = {
            ...this.formData,
            ...this.currentNews
          }
        }
      } catch (error) {
        console.error('获取新闻详情失败:', error)
        this.$message.error('获取新闻详情失败')
      } finally {
        this.loading = false
      }
    },

    async submitForm() {
      try {
        await this.$refs.form.validate()
        this.submitLoading = true

        // 设置作者（应该从登录信息获取，这里使用默认值）
        if (!this.formData.author) {
          this.formData.author = this.$store.getters.name || '高校管理员'
        }

        // 根据状态判断是否设置发布时间
        if (this.formData.status === 1 && !this.formData.publishTime) {
          this.formData.publishTime = new Date().toISOString()
        }

        if (this.isEdit) {
          // 更新新闻
          await this.updateNewsAction({
            id: this.formData.id,
            data: this.formData
          })
          this.$message.success('更新成功')
        } else {
          // 创建新闻
          await this.createNewsAction(this.formData)
          this.$message.success('创建成功')
        }

        // 跳转回列表页
        this.$router.push('/university-admin/news/list')
      } catch (error) {
        console.error('提交表单失败:', error)
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
