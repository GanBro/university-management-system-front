<!--src/views/university-admin/profile/index.vue-->
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>学校信息管理</span>
        <el-button style="float: right;" type="primary" @click="handleSave" :loading="saveLoading">保存修改</el-button>
      </div>

      <!-- 无数据时显示提示 -->
      <div v-if="noDataFound" class="no-data-container">
        <i class="el-icon-warning-outline warning-icon"></i>
        <h3>{{ errorTitle }}</h3>
        <p>{{ errorMessage }}</p>
        <el-button type="primary" @click="retryFetch" :loading="retryLoading">重新加载</el-button>
      </div>

      <el-form
        v-else
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
                placeholder="请输入藏书量(万册)"
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
              v-if="activeTab === 'introduction'"
              v-model="universityForm.introduction"
              placeholder="请输入学校简介..."
            />
          </el-tab-pane>

          <el-tab-pane label="院系设置" name="departments">
            <markdown-editor
              v-if="activeTab === 'departments'"
              v-model="universityForm.departments"
              placeholder="请输入院系设置信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="专业介绍" name="majors">
            <markdown-editor
              v-if="activeTab === 'majors'"
              v-model="universityForm.majors"
              placeholder="请输入专业介绍信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="录取规则" name="admissionRules">
            <markdown-editor
              v-if="activeTab === 'admissionRules'"
              v-model="universityForm.admissionRules"
              placeholder="请输入录取规则..."
            />
          </el-tab-pane>

          <el-tab-pane label="奖学金设置" name="scholarships">
            <markdown-editor
              v-if="activeTab === 'scholarships'"
              v-model="universityForm.scholarships"
              placeholder="请输入奖学金设置信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="食宿条件" name="accommodation">
            <markdown-editor
              v-if="activeTab === 'accommodation'"
              v-model="universityForm.accommodation"
              placeholder="请输入食宿条件信息..."
            />
          </el-tab-pane>

          <el-tab-pane label="联系方式" name="contactInfo">
            <markdown-editor
              v-if="activeTab === 'contactInfo'"
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
import MarkdownEditor from '@/components/Markdown/editor/index.vue'
import { mapState } from 'vuex'
import { getUserDetail } from '@/api/user'
import { getUniversityDetail, updateUniversity } from '@/api/university'
import { debounce } from 'lodash'

export default {
  name: 'UniversityAdminProfile',
  components: {
    MarkdownEditor
  },
  data() {
    return {
      loading: false,
      retryLoading: false,
      saveLoading: false,
      saveSuccessDialogVisible: false,
      activeTab: 'introduction',
      universityId: null,
      noDataFound: false,
      errorTitle: '无法加载学校数据',
      errorMessage: '请检查网络连接并稍后重试',
      fetchAttempts: 0,
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
        '北京市', '上海市', '天津市', '重庆市', '河北省', '江苏省', '浙江省', '山东省',
        '广东省', '湖北省', '湖南省', '四川省', '陕西省', '辽宁省', '江西省', '安徽省'
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
  computed: {
    ...mapState({
      userId: state => state.user.userId
    })
  },
  created() {
    this.getAdminUniversityId()
    // 使用防抖优化重试功能
    this.retryFetch = debounce(this._retryFetch, 300)
  },
  methods: {
    // 获取管理员关联的大学ID
    async getAdminUniversityId() {
      this.loading = true
      this.noDataFound = false

      try {
        if (!this.userId) {
          this.handleError('未获取到用户信息', '请重新登录系统后再试')
          return
        }

        // 获取当前用户详情，包含关联的大学ID
        const response = await getUserDetail(this.userId)
        const userData = response.data

        if (userData && userData.universityId) {
          this.universityId = userData.universityId
          await this.fetchUniversityDetail()
        } else {
          this.handleError('未找到关联的大学信息', '当前账号未关联到任何高校，请联系系统管理员')
        }
      } catch (error) {
        console.error('获取管理员所属大学失败:', error)
        this.handleError('获取管理员信息失败', '无法获取当前账号关联的高校信息，请稍后再试')
      }
    },

    // 错误处理统一方法
    handleError(title, message) {
      this.errorTitle = title
      this.errorMessage = message
      this.$message.error(title)
      this.noDataFound = true
      this.loading = false
    },

    async fetchUniversityDetail() {
      if (!this.universityId) {
        this.handleError('未找到关联的大学ID', '请联系系统管理员配置账号关联的高校')
        return
      }

      this.fetchAttempts++

      try {
        // 使用API函数获取大学详情
        const response = await getUniversityDetail(this.universityId)

        if (response && response.data) {
          // 更新表单数据
          this.universityForm = {
            ...this.universityForm,
            ...response.data
          }

          // 确保数字类型字段正确
          this.universityForm.studentCount = parseInt(this.universityForm.studentCount) || 0
          this.universityForm.teacherCount = parseInt(this.universityForm.teacherCount) || 0
          this.universityForm.libraryCount = parseInt(this.universityForm.libraryCount) || 0
          this.universityForm.campusArea = parseFloat(this.universityForm.campusArea) || 0

          this.noDataFound = false
        } else {
          this.handleError('获取数据格式不正确', '服务器返回的数据格式有误，请联系技术支持')
        }
      } catch (error) {
        console.error('获取学校详情失败:', error)

        // 根据错误类型提供更具体的错误信息
        let errorMessage = '网络错误，无法连接到服务器，请检查网络连接'

        if (error.message && error.message.includes('timeout')) {
          errorMessage = '请求超时，服务器响应时间过长，请检查网络连接'
        } else if (error.response) {
          errorMessage = `服务器错误 (${error.response.status})，请稍后再试`
        }

        this.handleError('获取学校信息失败', errorMessage)
      } finally {
        this.loading = false
      }
    },

    // 重试加载数据原始方法
    _retryFetch() {
      this.retryLoading = true

      if (this.fetchAttempts > 2) {
        this.$confirm('多次重试仍无法加载数据，是否继续尝试?', '警告', {
          confirmButtonText: '继续尝试',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 重置计数器
          this.fetchAttempts = 0
          this.loading = true
          this.fetchUniversityDetail().finally(() => {
            this.retryLoading = false
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消重试'
          })
          this.retryLoading = false
        })
      } else {
        this.loading = true
        this.fetchUniversityDetail().finally(() => {
          this.retryLoading = false
        })
      }
    },

    async handleSave() {
      try {
        // 表单验证
        await this.$refs.universityForm.validate()
        this.saveLoading = true

        // 准备提交的数据，过滤空值
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

        // 调用API进行保存
        await updateUniversity(this.universityId, submitForm)

        // 显示保存成功提示
        this.saveSuccessDialogVisible = true
      } catch (error) {
        console.error('保存失败:', error)

        let errorMsg = '未知错误'
        if (error.message) {
          errorMsg = error.message
        } else if (error.response && error.response.data) {
          errorMsg = error.response.data.message || '服务器错误'
        }

        this.$message.error('保存失败：' + errorMsg)
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
      min-height: 300px;
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

.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;

  .warning-icon {
    font-size: 64px;
    color: #E6A23C;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    color: #909399;
    margin-bottom: 20px;
    max-width: 400px;
  }
}
</style>
