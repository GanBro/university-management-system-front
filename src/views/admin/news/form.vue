// src/views/admin/news/form.vue
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

        <!-- 作者字段 - 无论创建还是编辑都完全一致 -->
        <el-form-item label="作者" prop="author">
          <el-input
            v-model="formData.author"
            placeholder="请输入作者，不填则使用当前用户名"
          >
            <template slot="append">
              <el-button @click="useCurrentUser">使用当前用户</el-button>
            </template>
            <template slot="suffix">
              <el-tooltip content="不填写时将自动使用当前用户名" placement="top">
                <i class="el-icon-info" style="color: #909399;"></i>
              </el-tooltip>
            </template>
          </el-input>
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
import MarkdownEditor from '@/components/Markdown/editor/index.vue'
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
      currentUsername: '', // 保存当前用户名
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
    // 获取当前用户信息
    this.getCurrentUsername();

    // 获取学校列表
    await this.fetchUniversities();

    // 判断是否为编辑模式
    const id = this.$route.params.id;
    if (id && !isNaN(parseInt(id))) {
      this.isEdit = true;
      await this.getDetail(parseInt(id));
    } else {
      // 只在创建模式下默认填充当前用户名
      this.formData.author = this.currentUsername;
    }
  },
  methods: {
    // 获取当前用户名
    getCurrentUsername() {
      try {
        const userInfo = this.$store.getters.userInfo;
        if (userInfo && userInfo.username) {
          this.currentUsername = userInfo.username;
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
      }
    },

    // 使用当前用户名填充作者字段
    useCurrentUser() {
      this.formData.author = this.currentUsername;
    },

    async fetchUniversities() {
      try {
        const { data } = await getUniversityList({ limit: 1000 });
        this.universities = data.records || [];
      } catch (error) {
        console.error('获取学校列表失败:', error);
        this.$message.error('获取学校列表失败');
      }
    },

    async getDetail(id) {
      if (!id) return;

      this.loading = true;
      try {
        const { data } = await getNewsDetail(id);
        this.formData = {
          ...this.formData,
          ...data
        };
      } catch (error) {
        console.error('获取信息详情失败:', error);
        this.$message.error('获取信息详情失败');
      } finally {
        this.loading = false;
      }
    },

    async submitForm() {
      try {
        // 表单验证
        await this.$refs.form.validate();

        this.submitLoading = true;

        // 如果没有填写作者，使用当前用户名
        if (!this.formData.author) {
          this.formData.author = this.currentUsername || '未知用户';
        }

        // 根据是否编辑模式选择不同的API
        if (this.isEdit) {
          await updateNews(this.$route.params.id, this.formData);
          this.$message.success('更新成功');
        } else {
          await createNews(this.formData);
          this.$message.success('发布成功');
        }

        // 返回列表页
        this.$router.push('/news/list');
      } catch (error) {
        console.error('提交表单失败:', error);
        this.$message.error(error.message || '提交失败');
      } finally {
        this.submitLoading = false;
      }
    },

    cancel() {
      this.$router.push('/news/list');
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
