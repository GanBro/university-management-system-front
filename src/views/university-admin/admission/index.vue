<!--src/views/university-admin/admission/index.vue-->
<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>招生数据管理</span>
        <el-button style="float: right;" type="primary" @click="handleAddAdmission">添加分数线</el-button>
      </div>

      <!-- 省份和年份筛选 -->
      <div class="filter-container">
        <el-select
          v-model="listQuery.province"
          placeholder="选择省份"
          clearable
          class="filter-item"
          @change="handleFilter"
        >
          <el-option
            v-for="item in provinceOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <el-select
          v-model="listQuery.year"
          placeholder="选择年份"
          clearable
          class="filter-item"
          @change="handleFilter"
        >
          <el-option
            v-for="item in yearOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <el-button type="primary" icon="el-icon-search" class="filter-item" @click="handleFilter">
          搜索
        </el-button>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="admissionList"
        border
        style="width: 100%"
        highlight-current-row
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column prop="province" label="省份" width="120" align="center" />
        <el-table-column prop="year" label="年份" width="100" align="center" />
        <el-table-column prop="scoreRequired" label="最低分数线" width="120" align="center" />
        <el-table-column label="计划/实际人数" width="150" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.planCount || '-' }}/{{ scope.row.actualCount || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lowestRank" label="最低位次" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.lowestRank ? scope.row.lowestRank.toLocaleString() : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成率" width="180" align="center">
          <template slot-scope="scope">
            <template v-if="calculateCompletionRate(scope.row)">
              <el-progress
                :percentage="calculateCompletionRate(scope.row)"
                :status="getProgressStatus(scope.row)"
              />
              <span class="completion-text">{{ calculateCompletionRate(scope.row).toFixed(1) }}%</span>
            </template>
            <template v-else>
              <span>-</span>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              @click="handleEdit(scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogStatus === 'create' ? '添加分数线' : '编辑分数线'"
      :visible.sync="dialogFormVisible"
      width="600px"
    >
      <el-form
        ref="dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="省份" prop="province">
          <el-select
            v-model="dialogForm.province"
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
        <el-form-item label="年份" prop="year">
          <el-date-picker
            v-model="dialogForm.year"
            type="year"
            format="yyyy"
            value-format="yyyy"
            placeholder="选择年份"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最低分数线" prop="scoreRequired">
          <el-input-number
            v-model="dialogForm.scoreRequired"
            :min="0"
            :max="750"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划人数" prop="planCount">
          <el-input-number
            v-model="dialogForm.planCount"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="实际人数" prop="actualCount">
          <el-input-number
            v-model="dialogForm.actualCount"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="最低位次" prop="lowestRank">
          <el-input-number
            v-model="dialogForm.lowestRank"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog" :loading="dialogSubmitLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  name: 'UniversityAdminAdmission',
  data() {
    return {
      loading: false,
      listQuery: {
        page: 1,
        limit: 10,
        province: undefined,
        year: undefined
      },
      total: 0,
      admissionList: [], // 分数线列表
      provinceOptions: [
        '北京市', '上海市', '天津市', '重庆市', '河北省', '江苏省', '浙江省', '山东省'
      ],
      yearOptions: [
        '2025', '2024', '2023', '2022', '2021', '2020'
      ],
      // 对话框相关
      dialogFormVisible: false,
      dialogStatus: 'create',
      dialogSubmitLoading: false,
      dialogForm: {
        province: '',
        year: '',
        scoreRequired: 0,
        planCount: null,
        actualCount: null,
        lowestRank: null
      },
      dialogRules: {
        province: [{ required: true, message: '请选择省份', trigger: 'change' }],
        year: [{ required: true, message: '请选择年份', trigger: 'change' }],
        scoreRequired: [{ required: true, message: '请输入最低分数线', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'role'
    ]),
    ...mapState({
      admissionListStore: state => state.admission.list,
      totalStore: state => state.admission.total,
      loadingStore: state => state.admission.loading
    }),
    universityId() {
      // 从store中获取当前用户管理的大学ID
      // 在实际项目中，您可能需要通过API获取这个值，或者从登录信息中获取
      return this.$store.getters.universityId || 1
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    ...mapActions({
      getAdmissionListAction: 'admission/getList',
      createAdmissionAction: 'admission/create',
      updateAdmissionAction: 'admission/update',
      deleteAdmissionAction: 'admission/delete'
    }),

    async fetchData() {
      this.loading = true
      try {
        await this.getAdmissionListAction({
          universityId: this.universityId,
          query: this.listQuery
        })
        this.admissionList = this.admissionListStore
        this.total = this.totalStore
      } catch (error) {
        console.error('获取分数线数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    handleFilter() {
      this.listQuery.page = 1
      this.fetchData()
    },

    handleSizeChange(val) {
      this.listQuery.limit = val
      this.fetchData()
    },

    handleCurrentChange(val) {
      this.listQuery.page = val
      this.fetchData()
    },

    // 计算完成率
    calculateCompletionRate(row) {
      if (!row.planCount || !row.actualCount) return 0
      const rate = (row.actualCount / row.planCount) * 100
      return Math.min(rate, 100) // 最大100%
    },

    // 获取进度条状态
    getProgressStatus(row) {
      const rate = this.calculateCompletionRate(row)
      if (!rate) return 'info'
      if (rate >= 100) return 'success'
      if (rate >= 90) return 'success'
      if (rate >= 80) return 'warning'
      return 'exception'
    },

    // 添加分数线
    handleAddAdmission() {
      this.dialogStatus = 'create'
      this.dialogForm = {
        universityId: this.universityId,
        province: '',
        year: new Date().getFullYear().toString(),
        scoreRequired: 0,
        planCount: null,
        actualCount: null,
        lowestRank: null
      }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
      })
    },

    // 编辑分数线
    handleEdit(row) {
      this.dialogStatus = 'update'
      this.dialogForm = { ...row, year: row.year.toString() }
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.dialogForm && this.$refs.dialogForm.clearValidate()
      })
    },

    // 删除分数线
    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该分数线记录?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await this.deleteAdmissionAction(row.id)
        this.$message.success('删除成功')
        this.fetchData()

      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }
    },

    // 提交对话框
    async submitDialog() {
      try {
        const valid = await this.$refs.dialogForm.validate()
        if (!valid) return

        this.dialogSubmitLoading = true

        // 准备提交的数据
        const formData = {
          ...this.dialogForm,
          universityId: this.universityId,
          year: parseInt(this.dialogForm.year)
        }

        if (this.dialogStatus === 'create') {
          await this.createAdmissionAction(formData)
          this.$message.success('添加成功')
        } else {
          await this.updateAdmissionAction({
            id: formData.id,
            data: formData
          })
          this.$message.success('更新成功')
        }

        this.dialogFormVisible = false
        this.fetchData()

      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error('提交失败: ' + (error.message || '未知错误'))
      } finally {
        this.dialogSubmitLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;

  .filter-item {
    margin-bottom: 10px;
  }
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.completion-text {
  margin-left: 10px;
  font-size: 12px;
  color: #606266;
}

.el-table ::v-deep(.success-row) {
  background: #f0f9eb;
}
</style>
