<!--src/views/university-admin/profile/index.vue-->
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>学校信息管理</span>
        <el-button style="float: right;" type="primary" @click="handleSave" :loading="saveLoading">保存修改</el-button>
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
              <el-input v-model="universityForm.name" placeholder="请输入高校名称" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所在省份" prop="province">
              <el-select
                v-model="universityForm.province"
                placeholder="请选择省份"
                style="width: 100%"
                disabled
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
                disabled
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
      </el-form>
    </el-card>

    <!-- 保存成功提示 -->
    <el-dialog
      title="保存成功"
      :visible.sync="saveSuccessDialogVisible"
      width="30%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="success-dialog-content">
        <i class="el-icon-success success-icon"></i>
        <p>学校信息已更新成功！</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveSuccessDialogVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUniversityDetail, updateUniversity } from '@/api/university'
import MarkdownEditor from '@/components/Markdown/editor/index.vue'

export default {
  name: 'UniversityAdminProfile',
  components: {
    MarkdownEditor
  },
  data() {
    return {
      loading: false,
      saveLoading: false,
      saveSuccessDialogVisible: false,
      activeTab: 'introduction',
      universityId: 1, // 假设当前管理员所属的高校 ID 为 1
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
        introduction: '',
        departments: '',
        majors: '',
        admissionRules: '',
        scholarships: '',
        accommodation: '',
        contactInfo: '',
        studentCount: null,
        teacherCount: null,
        libraryCount: null,
        campusArea: null
      },
      typeOptions: ['公立', '私立'],
      levelOptions: ['双一流', '985', '211', '普通高校'],
      provinceOptions: [
        '北京市', '上海市', '天津市', '重庆市', '河北省', '江苏省', '浙江省', '山东省'
      ],
      rules: {
        contactNumber: [
          { required: true, message: '请输入联系电话', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择学校类型', trigger: 'change' }
        ],
        website: [
          { required: true, message: '请输入官方网站', trigger: 'blur' }
        ],
        admissionWebsite: [
          { required: true, message: '请输入招生网站', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchUniversityDetail()
  },
  methods: {
    async fetchUniversityDetail() {
      this.loading = true
      try {
        // 实际项目中应该从用户状态或系统配置中获取当前管理员所属的大学 ID
        const { data } = await getUniversityDetail(this.universityId)
        this.universityForm = {
          ...this.universityForm,
          ...data
        }
      } catch (error) {
        console.error('获取学校详情失败:', error)
        this.$message.error('获取学校信息失败')
      } finally {
        this.loading = false
      }
    },
    async handleSave() {
      try {
        await this.$refs.universityForm.validate()
        this.saveLoading = true

        // 准备提交的数据
        const submitForm = {
          ...this.universityForm,
          // 处理可能为空字符串的字段
          introduction: this.universityForm.introduction || null,
          departments: this.universityForm.departments || null,
          majors: this.universityForm.majors || null,
          admissionRules: this.universityForm.admissionRules || null,
          scholarships: this.universityForm.scholarships || null,
          accommodation: this.universityForm.accommodation || null,
          contactInfo: this.universityForm.contactInfo || null
        }

        // 实际项目中这里应调用API进行保存
        // await updateUniversity(this.universityId, submitForm)

        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 显示保存成功提示
        this.saveSuccessDialogVisible = true
      } catch (error) {
        console.error('保存失败:', error)
        this.$message.error('保存失败：' + (error.message || '未知错误'))
      } finally {
        this.saveLoading = false
      }
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

  .el-input-number {
    width: 100%;
  }
}

.success-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .success-icon {
    font-size: 48px;
    color: #67C23A;
    margin-bottom: 15px;
  }

  p {
    font-size: 16px;
  }
}
</style>
