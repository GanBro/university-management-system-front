<template>
  <div class="app-container">
    <el-card v-loading="loading">
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
        <!-- 基本信息部分 -->
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="高校名称" prop="name">
              <el-input v-model="universityForm.name" placeholder="请输入高校名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
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
          <el-col :span="8">
            <el-form-item label="联系电话" prop="contactNumber">
              <el-input v-model="universityForm.contactNumber" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="学校类型" prop="type">
              <el-select
                v-model="universityForm.type"
                placeholder="请选择类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="学校层次" prop="level">
              <el-select
                v-model="universityForm.level"
                placeholder="请选择层次"
                style="width: 100%"
              >
                <el-option
                  v-for="item in levelOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="主管部门" prop="adminDepartment">
              <el-input v-model="universityForm.adminDepartment" placeholder="请输入主管部门" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 网站信息 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="官方网站" prop="website">
              <el-input v-model="universityForm.website" placeholder="请输入官方网站地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="招生网站" prop="admissionWebsite">
              <el-input v-model="universityForm.admissionWebsite" placeholder="请输入招生网站地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 地址信息 -->
        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="universityForm.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <!-- 特色标签 -->
        <el-form-item label="特色标签" prop="features">
          <el-select
            v-model="universityForm.features"
            multiple
            placeholder="请选择特色标签"
            style="width: 100%"
          >
            <el-option
              v-for="item in featureOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <!-- 规模信息 -->
        <el-divider content-position="left">规模信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="在校生数量" prop="studentCount">
              <el-input-number
                v-model="universityForm.studentCount"
                :min="0"
                :controls-position="'right'"
                placeholder="请输入在校生数量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="教师数量" prop="teacherCount">
              <el-input-number
                v-model="universityForm.teacherCount"
                :min="0"
                :controls-position="'right'"
                placeholder="请输入教师数量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="图书馆藏书量" prop="libraryCount">
              <el-input-number
                v-model="universityForm.libraryCount"
                :min="0"
                :controls-position="'right'"
                placeholder="请输入藏书量"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="校园面积(㎡)" prop="campusArea">
              <el-input-number
                v-model="universityForm.campusArea"
                :min="0"
                :controls-position="'right'"
                placeholder="请输入校园面积"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 详细信息标签页 -->
        <el-divider content-position="left">详细信息</el-divider>
        <el-tabs v-model="activeTab" type="border-card" class="markdown-tabs">
          <el-tab-pane label="学校简介" name="introduction">
            <markdown-editor
              v-model="universityForm.introduction"
              placeholder="请输入学校简介..."
            />
          </el-tab-pane>

          <el-tab-pane label="院系设置" name="departments">
            <markdown-editor
              v-model="universityForm.departments"
              placeholder="请输入院系设置信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="专业介绍" name="majors">
            <markdown-editor
              v-model="universityForm.majors"
              placeholder="请输入专业介绍信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="录取规则" name="admissionRules">
            <markdown-editor
              v-model="universityForm.admissionRules"
              placeholder="请输入录取规则..."
            />
          </el-tab-pane>

          <el-tab-pane label="奖学金设置" name="scholarships">
            <markdown-editor
              v-model="universityForm.scholarships"
              placeholder="请输入奖学金设置信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="食宿条件" name="accommodation">
            <markdown-editor
              v-model="universityForm.accommodation"
              placeholder="请输入食宿条件信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="联系方式" name="contactInfo">
            <markdown-editor
              v-model="universityForm.contactInfo"
              placeholder="请输入联系方式信息..."
            />
          </el-tab-pane>
        </el-tabs>

        <el-form-item class="form-footer">
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
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
      submitLoading: false,
      activeTab: 'introduction',
      universityForm: {
        name: '',
        province: '',
        address: '',
        adminDepartment: '',
        website: '',
        admissionWebsite: '',
        contactNumber: '',
        type: '',
        level: '',
        features: [],
        // 设置默认值为空字符串而不是 undefined
        introduction: '',
        departments: '',
        majors: '',
        admissionRules: '',
        scholarships: '',
        accommodation: '',
        contactInfo: '',
        // 数值类型设置为 null
        studentCount: null,
        teacherCount: null,
        libraryCount: null,
        campusArea: null
      },
      typeOptions: ['公立', '私立'],
      levelOptions: ['双一流', '985', '211', '普通高校'],
      provinceOptions: [
        '北京市', '上海市', '天津市', '重庆市', '河北省'],
      featureOptions: ['双一流', '985工程', '211工程'],
      rules: {
        // 添加必要的验证规则
        name: [
          { required: true, message: '请输入高校名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        province: [{ required: true, message: '请选择省份', trigger: 'change' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        level: [{ required: true, message: '请选择层次', trigger: 'change' }]
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
    async submitForm() {
      try {
        const valid = await this.$refs.universityForm.validate()
        if (valid) {
          this.submitLoading = true
          const formData = {
            ...this.universityForm,
            // 处理可能为空字符串的字段
            introduction: this.universityForm.introduction || null,
            departments: this.universityForm.departments || null,
            majors: this.universityForm.majors || null,
            admissionRules: this.universityForm.admissionRules || null,
            scholarships: this.universityForm.scholarships || null,
            accommodation: this.universityForm.accommodation || null,
            contactInfo: this.universityForm.contactInfo || null,
            // 处理数值类型
            studentCount: this.universityForm.studentCount || null,
            teacherCount: this.universityForm.teacherCount || null,
            libraryCount: this.universityForm.libraryCount || null,
            campusArea: this.universityForm.campusArea || null
          }

          if (this.isEdit) {
            await updateUniversity(this.$route.params.id, formData)
            this.$message.success('更新成功')
          } else {
            await createUniversity(formData)
            this.$message.success('创建成功')
          }
          this.$router.push('/university/list')
        }
      } catch (error) {
        console.error('表单提交失败:', error)
        this.$message.error(error.message || '提交失败')
      } finally {
        this.submitLoading = false
      }
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

  .el-input-number {
    width: 100%;
  }
}
</style>
