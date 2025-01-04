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

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所在城市" prop="city">
              <el-input v-model="universityForm.city" placeholder="请输入城市" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
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
          <el-col :span="12">
            <el-form-item label="主管部门" prop="admin_department">
              <el-input v-model="universityForm.admin_department" placeholder="请输入主管部门" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="官方网站" prop="website">
              <el-input v-model="universityForm.website" placeholder="请输入官方网站地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="招生网站" prop="admission_website">
              <el-input v-model="universityForm.admission_website" placeholder="请输入招生网站地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="universityForm.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ isEdit ? '更新' : '创建' }}</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getUniversityDetail, createUniversity, updateUniversity } from '@/api/university'

export default {
  name: 'UniversityForm',
  data() {
    return {
      isEdit: false,
      loading: false,
      universityForm: {
        name: '',
        province: '',
        city: '',
        address: '',
        admin_department: '',
        website: '',
        admission_website: '',
        type: '',
        level: ''
      },
      provinceOptions: ['北京市', '上海市', '江苏省', '浙江省'], // 需要补充完整的省份列表
      typeOptions: ['公立', '私立', '独立学院'],
      levelOptions: ['双一流', '985', '211', '普通高校'],
      rules: {
        name: [
          { required: true, message: '请输入高校名称', trigger: 'blur' }
        ],
        province: [
          { required: true, message: '请选择省份', trigger: 'change' }
        ],
        city: [
          { required: true, message: '请输入城市', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ]
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
        this.universityForm = data
      } catch (error) {
        console.error('Failed to get university detail:', error)
      }
      this.loading = false
    },
    async submitForm() {
      this.$refs.universityForm.validate(async valid => {
        if (valid) {
          try {
            if (this.isEdit) {
              await updateUniversity(this.$route.params.id, this.universityForm)
              this.$message.success('更新成功')
            } else {
              await createUniversity(this.universityForm)
              this.$message.success('创建成功')
            }
            this.$router.push('/university/list')
          } catch (error) {
            console.error('Failed to submit form:', error)
          }
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
}
</style>
