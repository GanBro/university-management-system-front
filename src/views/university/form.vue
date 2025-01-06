<!-- src/views/university/form.vue -->
<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '编辑高校' : '添加高校' }}</span>
      </div>

      <el-form
        ref="universityForm"
        :model="universityForm"
        :rules="rules"
        label-width="120px"
        class="university-form"
      >
        <!-- 基本信息区域 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="高校名称" prop="name">
              <el-input v-model="universityForm.name" placeholder="请输入高校名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所在省份" prop="province">
              <el-select
                v-model="universityForm.province"
                placeholder="请选择省份"
                style="width: 100%"
              >
                <el-option
                  v-for="item in provinceOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 原有的基本信息表单项... -->

        <!-- Markdown内容区域 -->
        <el-divider content-position="left">详细信息</el-divider>
        <el-tabs v-model="activeTab" type="border-card" class="markdown-tabs">
          <el-tab-pane label="学校简介" name="introduction">
            <markdown-editor
              v-model="universityForm.introduction"
              placeholder="请输入学校简介..."
              @input="handleMarkdownChange('introduction', $event)"
            />
          </el-tab-pane>

          <el-tab-pane label="院系设置" name="departments">
            <markdown-editor
              v-model="universityForm.departments"
              placeholder="请输入院系设置信息..."
              @input="handleMarkdownChange('departments', $event)"
            />
          </el-tab-pane>

          <el-tab-pane label="专业介绍" name="majors">
            <markdown-editor
              v-model="universityForm.majors"
              placeholder="请输入专业介绍信息..."
              @input="handleMarkdownChange('majors', $event)"
            />
          </el-tab-pane>

          <el-tab-pane label="录取规则" name="admission_rules">
            <markdown-editor
              v-model="universityForm.admission_rules"
              placeholder="请输入录取规则..."
              @input="handleMarkdownChange('admission_rules', $event)"
            />
          </el-tab-pane>

          <el-tab-pane label="奖学金设置" name="scholarships">
            <markdown-editor
              v-model="universityForm.scholarships"
              placeholder="请输入奖学金设置信息..."
              @input="handleMarkdownChange('scholarships', $event)"
            />
          </el-tab-pane>

          <el-tab-pane label="食宿条件" name="accommodation">
            <markdown-editor
              v-model="universityForm.accommodation"
              placeholder="请输入食宿条件信息..."
              @input="handleMarkdownChange('accommodation', $event)"
            />
          </el-tab-pane>

          <el-tab-pane label="联系方式" name="contact_info">
            <markdown-editor
              v-model="universityForm.contact_info"
              placeholder="请输入联系方式信息..."
              @input="handleMarkdownChange('contact_info', $event)"
            />
          </el-tab-pane>
        </el-tabs>

        <el-form-item class="form-footer">
          <el-button type="primary" @click="submitForm" :loading="loading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getUniversityDetail, createUniversity, updateUniversity } from '@/api/university'
import MarkdownEditor from '@/components/Markdown/editor'

export default {
  name: 'UniversityForm',
  components: {
    MarkdownEditor
  },
  data() {
    return {
      isEdit: false,
      loading: false,
      activeTab: 'introduction',
      universityForm: {
        // 基本信息字段
        name: '',
        province: '',
        city: '',
        address: '',
        admin_department: '',
        website: '',
        admission_website: '',
        type: '',
        level: '',
        // Markdown内容字段
        introduction: '',
        departments: '',
        majors: '',
        admission_rules: '',
        scholarships: '',
        accommodation: '',
        contact_info: ''
      },
      provinceOptions: ['北京市', '上海市', '江苏省', '浙江省'],
      typeOptions: ['公立', '私立', '独立学院'],
      levelOptions: ['双一流', '985', '211', '普通高校'],
      rules: {
        name: [{ required: true, message: '请输入高校名称', trigger: 'blur' }],
        province: [{ required: true, message: '请选择省份', trigger: 'change' }],
        city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      }
    }
  },
  created() {
    if (this.$route.params.id) {
      this.isEdit = true
      this.getDetail()
    }
  },
  methods: {
    async getDetail() {
      this.loading = true
      try {
        const { data } = await getUniversityDetail(this.$route.params.id)
        // 合并数据，保留原有的默认值
        this.universityForm = {
          ...this.universityForm,
          ...data
        }
      } catch (error) {
        console.error('Failed to get university detail:', error)
        this.$message.error('获取信息失败')
      }
      this.loading = false
    },
    handleMarkdownChange(field, value) {
      // 实时同步Markdown内容到表单数据
      this.universityForm[field] = value
    },
    async submitForm() {
      this.$refs.universityForm.validate(async valid => {
        if (valid) {
          this.loading = true
          try {
            // 处理表单数据，确保空字符串转为null
            const formData = {
              ...this.universityForm,
              introduction: this.universityForm.introduction || null,
              departments: this.universityForm.departments || null,
              majors: this.universityForm.majors || null,
              admission_rules: this.universityForm.admission_rules || null,
              scholarships: this.universityForm.scholarships || null,
              accommodation: this.universityForm.accommodation || null,
              contact_info: this.universityForm.contact_info || null
            }

            if (this.isEdit) {
              await updateUniversity(this.$route.params.id, formData)
              this.$message.success('更新成功')
            } else {
              await createUniversity(formData)
              this.$message.success('创建成功')
            }
            this.$router.push('/university/list')
          } catch (error) {
            console.error('Failed to submit form:', error)
            this.$message.error('提交失败：' + error.message)
          }
          this.loading = false
        }
      })
    },
    cancel() {
      this.$router.push('/university/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.university-form {
  margin: 20px;
  max-width: 1200px;

  .el-divider {
    margin: 24px 0;
  }

  .markdown-tabs {
    margin: 20px 0;

    ::v-deep .el-tabs__content {
      padding: 20px;
    }
  }

  .form-footer {
    margin-top: 24px;
    text-align: center;
  }
}
</style>

