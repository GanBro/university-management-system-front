<!--src/views/university-admin/satisfaction/index.vue-->
<template>
  <div class="satisfaction-management">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>满意度管理</span>
        <div class="operation-group">
          <el-button type="primary" size="small" @click="handleAdd">添加记录</el-button>
          <el-button type="primary" size="small" @click="showAnalysisDialog">数据分析</el-button>
        </div>
      </div>

      <!-- 满意度类型切换 -->
      <el-tabs v-model="activeSatisfactionType" @tab-click="handleTabChange">
        <el-tab-pane label="专业满意度" name="major"></el-tab-pane>
        <el-tab-pane label="院校满意度" name="university"></el-tab-pane>
      </el-tabs>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" ref="searchForm">
          <!-- 专业满意度搜索条件 -->
          <template v-if="activeSatisfactionType === 'major'">
            <el-form-item label="专业类别">
              <el-input v-model="searchForm.category" placeholder="请输入专业类别" clearable></el-input>
            </el-form-item>
          </template>

          <el-form-item label="评分范围">
            <el-select v-model="searchForm.ratingRange" placeholder="请选择" clearable>
              <el-option label="4分以上" value="4+" />
              <el-option label="3-4分" value="3-4" />
              <el-option label="3分以下" value="-3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 专业满意度表格 -->
      <el-table
        v-if="activeSatisfactionType === 'major'"
        :data="majorTableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="category" label="专业类别" />
        <el-table-column label="满意度评分" width="120" align="center">
          <template slot-scope="scope">
            <div class="rating-display">
              <span class="rating-value">{{ Number(scope.row.rating).toFixed(1) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ratingCount" label="评价人数" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleEdit(scope.row, 'major')"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              @click="handleDelete(scope.row, 'major')"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 院校满意度表格 -->
      <el-table
        v-if="activeSatisfactionType === 'university'"
        :data="universityTableData"
        border
        style="width: 100%"
      >
        <el-table-column label="满意度类型">
          <template slot-scope="scope">
            {{ scope.row.type }}
          </template>
        </el-table-column>
        <el-table-column label="满意度评分" width="120" align="center">
          <template slot-scope="scope">
            <div class="rating-display">
              <span class="rating-value">{{ Number(scope.row.rating).toFixed(1) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="评价人数" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              @click="handleEdit(scope.row, 'university')"
            >编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </el-card>

    <!-- 专业满意度编辑对话框 -->
    <el-dialog
      :title="majorDialogTitle"
      :visible.sync="majorEditDialogVisible"
      width="500px"
    >
      <el-form :model="majorEditForm" :rules="majorEditRules" ref="majorEditForm" label-width="100px">
        <el-form-item label="专业类别" prop="category">
          <el-input v-model="majorEditForm.category"></el-input>
        </el-form-item>
        <el-form-item label="满意度评分" prop="rating">
          <el-input-number
            v-model="majorEditForm.rating"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="5"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="评价人数" prop="ratingCount">
          <el-input-number v-model="majorEditForm.ratingCount" :min="0" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="majorEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitMajorForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 院校满意度编辑对话框 -->
    <el-dialog
      :title="universityDialogTitle"
      :visible.sync="universityEditDialogVisible"
      width="500px"
    >
      <el-form :model="universityEditForm" :rules="universityEditRules" ref="universityEditForm" label-width="120px">
        <el-form-item label="综合满意度" prop="overallRating">
          <el-input-number
            v-model="universityEditForm.overallRating"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="5"
            size="small"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="综合评价人数" prop="overallCount">
          <el-input-number v-model="universityEditForm.overallCount" :min="0" :step="1"></el-input-number>
        </el-form-item>
        <el-form-item label="环境满意度" prop="environmentRating">
          <el-input-number
            v-model="universityEditForm.environmentRating"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="5"
            size="small"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="环境评价人数" prop="environmentCount">
          <el-input-number v-model="universityEditForm.environmentCount" :min="0" :step="1"></el-input-number>
        </el-form-item>
        <el-form-item label="生活满意度" prop="lifeRating">
          <el-input-number
            v-model="universityEditForm.lifeRating"
            :precision="1"
            :step="0.1"
            :min="0"
            :max="5"
            size="small"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="生活评价人数" prop="lifeCount">
          <el-input-number v-model="universityEditForm.lifeCount" :min="0" :step="1"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="universityEditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitUniversityForm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 数据分析对话框 -->
    <el-dialog
      :title="`${activeSatisfactionType === 'major' ? '专业' : '院校'}满意度数据分析`"
      :visible.sync="analysisDialogVisible"
      width="80%"
    >
      <div class="analysis-text">
        <h3>数据分析结果</h3>
        <p>根据{{ activeSatisfactionType === 'major' ? '专业' : '院校' }}满意度数据分析，我校满意度评价呈现以下特点：</p>

        <!-- 专业满意度分析 -->
        <template v-if="activeSatisfactionType === 'major'">
          <ol>
            <li><strong>整体满意度良好</strong>：专业平均满意度评分为 {{ majorAvgRating.toFixed(1) }} 分。</li>
            <li><strong>学生参与积极</strong>：共有 {{ majorTotalRatings }} 人次参与评价。</li>
            <li v-if="majorTableData.length > 0"><strong>专业差异情况</strong>：评分最高的专业为 {{ highestRatedMajor.category || '无' }}（{{ highestRatedMajor.rating ? Number(highestRatedMajor.rating).toFixed(1) : 0 }}分），评分最低的专业为 {{ lowestRatedMajor.category || '无' }}（{{ lowestRatedMajor.rating ? Number(lowestRatedMajor.rating).toFixed(1) : 0 }}分）。</li>
          </ol>
        </template>

        <!-- 院校满意度分析 -->
        <template v-else>
          <ol>
            <li><strong>综合满意度表现良好</strong>：综合满意度评分为 {{ Number(universityOverallRating).toFixed(1) }} 分。</li>
            <li><strong>环境满意度表现突出</strong>：环境满意度评分为 {{ Number(universityEnvironmentRating).toFixed(1) }} 分。</li>
            <li><strong>生活满意度情况</strong>：生活满意度评分为 {{ Number(universityLifeRating).toFixed(1) }} 分。</li>
            <li><strong>学生参与度高</strong>：共有 {{ universityTotalCount }} 人次参与院校满意度评价。</li>
          </ol>
        </template>
      </div>
    </el-dialog>

    <!-- 删除确认框 -->
    <el-dialog
      title="确认删除"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <div>确定要删除 "{{ deleteItem.category }}" 的满意度记录吗？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmDelete">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入正确的API函数
import { getMajorSatisfaction } from '@/api/university'
import { getUniversitySatisfactionDetail, saveUniversitySatisfaction } from '@/api/universitySatisfaction'

// 用于处理满意度数据的方法
import { updateSatisfactionRating, deleteSatisfactionRating } from '@/api/university'

export default {
  name: 'SatisfactionManagement',
  data() {
    return {
      loading: false,
      activeSatisfactionType: 'major', // 默认显示专业满意度

      // 搜索表单
      searchForm: {
        category: '',
        ratingRange: '',
      },

      // 专业满意度表格数据
      majorTableData: [],

      // 院校满意度表格数据
      universityTableData: [],

      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,

      // 专业满意度编辑表单
      majorEditForm: {
        id: null,
        universityId: null,
        category: '',
        rating: 0,
        ratingCount: 0
      },

      // 院校满意度编辑表单
      universityEditForm: {
        id: null,
        universityId: null,
        overallRating: 0,
        overallCount: 0,
        environmentRating: 0,
        environmentCount: 0,
        lifeRating: 0,
        lifeCount: 0
      },

      // 专业满意度表单验证规则
      majorEditRules: {
        category: [
          { required: true, message: '请输入专业类别', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        rating: [
          { required: true, message: '请输入评分', trigger: 'change' },
          { type: 'number', min: 0, max: 5, message: '评分范围在 0 到 5 分', trigger: 'change' }
        ],
        ratingCount: [
          { required: true, message: '请输入评价人数', trigger: 'blur' },
          { type: 'number', min: 0, message: '评价人数必须大于等于0', trigger: 'blur' }
        ]
      },

      // 院校满意度表单验证规则
      universityEditRules: {
        overallRating: [
          { required: true, message: '请输入综合满意度评分', trigger: 'change' },
          { type: 'number', min: 0, max: 5, message: '评分范围在 0 到 5 分', trigger: 'change' }
        ],
        overallCount: [
          { required: true, message: '请输入评价人数', trigger: 'blur' },
          { type: 'number', min: 0, message: '评价人数必须大于等于0', trigger: 'blur' }
        ],
        environmentRating: [
          { required: true, message: '请输入环境满意度评分', trigger: 'change' },
          { type: 'number', min: 0, max: 5, message: '评分范围在 0 到 5 分', trigger: 'change' }
        ],
        environmentCount: [
          { required: true, message: '请输入评价人数', trigger: 'blur' },
          { type: 'number', min: 0, message: '评价人数必须大于等于0', trigger: 'blur' }
        ],
        lifeRating: [
          { required: true, message: '请输入生活满意度评分', trigger: 'change' },
          { type: 'number', min: 0, max: 5, message: '评分范围在 0 到 5 分', trigger: 'change' }
        ],
        lifeCount: [
          { required: true, message: '请输入评价人数', trigger: 'blur' },
          { type: 'number', min: 0, message: '评价人数必须大于等于0', trigger: 'blur' }
        ]
      },

      // 对话框
      majorEditDialogVisible: false,
      universityEditDialogVisible: false,
      deleteDialogVisible: false,
      analysisDialogVisible: false,

      // 删除项
      deleteItem: {},
      deleteType: 'major',

      // 分类选项 - 基于您的数据库中的专业类别
      categoryOptions: [
        { label: '计算机科学与技术', value: '计算机科学与技术' },
        { label: '数学', value: '数学' },
        { label: '物理学', value: '物理学' },
        { label: '化学', value: '化学' },
        { label: '生物科学', value: '生物科学' },
        { label: '中国语言文学', value: '中国语言文学' },
        { label: '法学', value: '法学' },
        { label: '经济学类', value: '经济学类' }
      ],

      // 用户所属大学ID
      universityId: null
    }
  },
  computed: {
    // 专业满意度对话框标题
    majorDialogTitle() {
      return this.majorEditForm.id ? '编辑专业满意度记录' : '添加专业满意度记录'
    },

    // 院校满意度对话框标题
    universityDialogTitle() {
      return '编辑院校满意度'
    },

    // 专业满意度平均评分
    majorAvgRating() {
      if (this.majorTableData.length === 0) return 0
      const sum = this.majorTableData.reduce((acc, cur) => acc + parseFloat(cur.rating || 0), 0)
      return sum / this.majorTableData.length
    },

    // 专业满意度总评价人数
    majorTotalRatings() {
      return this.majorTableData.reduce((acc, cur) => acc + (cur.ratingCount || 0), 0)
    },

    // 评分最高的专业
    highestRatedMajor() {
      if (this.majorTableData.length === 0) return { category: '无', rating: 0 }
      return this.majorTableData.reduce((prev, current) =>
        (parseFloat(prev.rating || 0) > parseFloat(current.rating || 0)) ? prev : current
      )
    },

    // 评分最低的专业
    lowestRatedMajor() {
      if (this.majorTableData.length === 0) return { category: '无', rating: 0 }
      return this.majorTableData.reduce((prev, current) =>
        (parseFloat(prev.rating || 0) < parseFloat(current.rating || 0)) ? prev : current
      )
    },

    // 院校综合满意度
    universityOverallRating() {
      const item = this.universityTableData.find(item => item.type === '综合满意度')
      return item ? item.rating : 0
    },

    // 院校环境满意度
    universityEnvironmentRating() {
      const item = this.universityTableData.find(item => item.type === '环境满意度')
      return item ? item.rating : 0
    },

    // 院校生活满意度
    universityLifeRating() {
      const item = this.universityTableData.find(item => item.type === '生活满意度')
      return item ? item.rating : 0
    },

    // 院校满意度总评价人数
    universityTotalCount() {
      return this.universityTableData.reduce((acc, cur) => acc + (cur.count || 0), 0)
    }
  },
  created() {
    // 获取当前高校管理员的大学ID
    this.universityId = this.$store.getters.universityId || 1
    console.log('当前大学ID:', this.universityId)
    this.fetchData()
  },
  methods: {
    // 处理Tab切换
    handleTabChange() {
      this.currentPage = 1
      this.fetchData()
    },

    // 获取数据
    async fetchData() {
      this.loading = true

      try {
        if (this.activeSatisfactionType === 'major') {
          // 获取专业满意度数据
          await this.fetchMajorSatisfactionData()
        } else {
          // 获取院校满意度数据
          await this.fetchUniversitySatisfactionData()
        }
      } catch (error) {
        console.error(`获取${this.activeSatisfactionType === 'major' ? '专业' : '院校'}满意度数据失败:`, error)
        this.$message.error(`获取${this.activeSatisfactionType === 'major' ? '专业' : '院校'}满意度数据失败`)
      } finally {
        this.loading = false
      }
    },

    // 获取专业满意度数据 - 使用现有API
    async fetchMajorSatisfactionData() {
      try {
        const excludeCategories = ['综合评价', '环境', '生活']
        console.log('获取专业满意度数据, universityId:', this.universityId)

        // 使用正确的API - 直接通过大学ID获取专业满意度
        const response = await getMajorSatisfaction(this.universityId)
        console.log('专业满意度API返回数据:', response)

        if (response && response.data && Array.isArray(response.data)) {
          // 过滤掉特殊类别，并且格式化数据
          this.majorTableData = response.data
            .filter(item => !excludeCategories.includes(item.name))
            .map(item => ({
              id: item.id,
              universityId: this.universityId,
              category: item.name,
              rating: parseFloat(item.rating) || 0,
              ratingCount: item.count || 0
            }))

          // 可以用原数据长度作为total
          this.total = this.majorTableData.length

          // 根据搜索条件进行筛选
          this.applyMajorFilters()
        } else {
          this.$message.warning('未获取到专业满意度数据')
          this.majorTableData = []
          this.total = 0
        }
      } catch (error) {
        console.error('获取专业满意度列表失败:', error)
        this.$message.error('获取专业满意度数据失败: ' + (error.message || '未知错误'))
        this.majorTableData = []
        this.total = 0
      }
    },

    // 应用专业满意度筛选
    applyMajorFilters() {
      let filtered = [...this.majorTableData]

      // 按专业类别筛选
      if (this.searchForm.category) {
        const keyword = this.searchForm.category.toLowerCase()
        filtered = filtered.filter(item =>
          item.category.toLowerCase().includes(keyword)
        )
      }

      // 按评分范围筛选
      if (this.searchForm.ratingRange) {
        const range = this.searchForm.ratingRange
        if (range === '4+') {
          filtered = filtered.filter(item => item.rating >= 4)
        } else if (range === '3-4') {
          filtered = filtered.filter(item => item.rating >= 3 && item.rating < 4)
        } else if (range === '-3') {
          filtered = filtered.filter(item => item.rating < 3)
        }
      }

      // 更新表格数据和总数
      this.majorTableData = filtered
      this.total = filtered.length
    },

    // 获取院校满意度数据
    async fetchUniversitySatisfactionData() {
      try {
        console.log('获取院校满意度数据, universityId:', this.universityId)

        // 使用API获取院校满意度数据
        const response = await getUniversitySatisfactionDetail(this.universityId)
        console.log('院校满意度API返回数据:', response)

        if (response && response.data) {
          const data = response.data
          // 转换为表格数据格式
          this.universityTableData = [
            {
              type: '综合满意度',
              rating: parseFloat(data.overallRating) || 0,
              count: data.overallCount || 0
            },
            {
              type: '环境满意度',
              rating: parseFloat(data.environmentRating) || 0,
              count: data.environmentCount || 0
            },
            {
              type: '生活满意度',
              rating: parseFloat(data.lifeRating) || 0,
              count: data.lifeCount || 0
            }
          ]

          // 保存表单数据
          this.universityEditForm = {
            id: data.id,
            universityId: data.universityId || this.universityId,
            overallRating: parseFloat(data.overallRating) || 0,
            overallCount: data.overallCount || 0,
            environmentRating: parseFloat(data.environmentRating) || 0,
            environmentCount: data.environmentCount || 0,
            lifeRating: parseFloat(data.lifeRating) || 0,
            lifeCount: data.lifeCount || 0
          }

          this.total = 3 // 固定为3条记录
          console.log('处理后的院校满意度数据:', this.universityTableData)
        } else {
          console.warn('未获取到院校满意度数据')
          this.$message.warning('未获取到院校满意度数据')
          this.universityTableData = []
          this.universityEditForm = {
            id: null,
            universityId: this.universityId,
            overallRating: 0,
            overallCount: 0,
            environmentRating: 0,
            environmentCount: 0,
            lifeRating: 0,
            lifeCount: 0
          }
          this.total = 0
        }
      } catch (error) {
        console.error('获取院校满意度数据失败:', error)
        this.$message.error('获取院校满意度数据失败: ' + (error.message || '未知错误'))
        this.universityTableData = []
        this.total = 0
      }
    },

    // 添加记录
    handleAdd() {
      if (this.activeSatisfactionType === 'major') {
        this.majorEditForm = {
          id: null,
          universityId: this.universityId,
          category: '',
          rating: 0,
          ratingCount: 0
        }
        this.majorEditDialogVisible = true
      } else {
        // 院校满意度不允许添加新记录，因为一个大学只有一条院校满意度记录
        this.$message.info('请直接编辑现有的院校满意度记录')
      }
    },

    // 编辑记录
    handleEdit(row, type) {
      if (type === 'major') {
        this.majorEditForm = {
          id: row.id,
          universityId: row.universityId || this.universityId,
          category: row.category,
          rating: parseFloat(row.rating) || 0,
          ratingCount: row.ratingCount || 0
        }
        this.majorEditDialogVisible = true
      } else {
        // 对于院校满意度，显示编辑对话框
        this.universityEditDialogVisible = true
      }
    },

    // 删除记录
    handleDelete(row, type) {
      this.deleteItem = row
      this.deleteType = type
      this.deleteDialogVisible = true
    },

    // 确认删除
    async confirmDelete() {
      try {
        if (this.deleteType === 'major') {
          console.log('删除专业满意度记录:', this.deleteItem.id);

          // 调用删除API
          await deleteSatisfactionRating(this.deleteItem.id)

          this.$message.success('删除成功');
          this.deleteDialogVisible = false;

          // 刷新数据
          this.fetchMajorSatisfactionData();
        } else {
          // 院校满意度不允许删除
          this.$message.info('院校满意度记录不能删除')
          this.deleteDialogVisible = false
        }
      } catch (error) {
        console.error('删除满意度记录失败:', error)
        this.$message.error('删除失败: ' + (error.message || '未知错误'))
      }
    },

    // 提交专业满意度表单
    submitMajorForm() {
      this.$refs.majorEditForm.validate(async (valid) => {
        if (valid) {
          try {
            // 构建提交数据
            const data = {
              id: this.majorEditForm.id,
              universityId: this.majorEditForm.universityId || this.universityId,
              name: this.majorEditForm.category,
              rating: this.majorEditForm.rating,
              count: this.majorEditForm.ratingCount
            }

            console.log('保存专业满意度数据:', data)

            // 调用更新API
            await updateSatisfactionRating(data)

            this.$message.success(this.majorEditForm.id ? '更新成功' : '添加成功')
            this.majorEditDialogVisible = false

            // 刷新数据
            this.fetchMajorSatisfactionData()
          } catch (error) {
            console.error('保存专业满意度记录失败:', error)
            this.$message.error('保存失败: ' + (error.message || '未知错误'))
          }
        } else {
          return false
        }
      })
    },

    // 提交院校满意度表单
    submitUniversityForm() {
      this.$refs.universityEditForm.validate(async (valid) => {
        if (valid) {
          try {
            // 构建提交数据
            const data = {
              id: this.universityEditForm.id,
              universityId: this.universityEditForm.universityId || this.universityId,
              overallRating: this.universityEditForm.overallRating,
              overallCount: this.universityEditForm.overallCount,
              environmentRating: this.universityEditForm.environmentRating,
              environmentCount: this.universityEditForm.environmentCount,
              lifeRating: this.universityEditForm.lifeRating,
              lifeCount: this.universityEditForm.lifeCount
            }

            console.log('保存院校满意度数据:', data)

            // 调用保存API
            const response = await saveUniversitySatisfaction(data)
            console.log('保存院校满意度响应:', response)

            this.$message.success('更新成功')
            this.universityEditDialogVisible = false
            this.fetchUniversitySatisfactionData() // 重新加载院校满意度数据
          } catch (error) {
            console.error('保存院校满意度记录失败:', error)
            this.$message.error('保存失败: ' + (error.message || '未知错误'))
          }
        } else {
          return false
        }
      })
    },

    // 搜索
    handleSearch() {
      this.currentPage = 1
      if (this.activeSatisfactionType === 'major') {
        this.applyMajorFilters()
      }
    },

    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.fetchData()
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },

    // 页码变化
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },

    // 显示分析对话框
    showAnalysisDialog() {
      this.analysisDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.satisfaction-management {
  padding: 20px;

  .el-card {
    .clearfix {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .search-bar {
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .pagination-container {
    margin-top: 20px;
    text-align: center;
  }

  .analysis-text {
    padding: 20px;
    background: #f9f9f9;
    border-radius: 4px;

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #409EFF;
    }

    p {
      margin-bottom: 10px;
    }

    ol {
      padding-left: 20px;

      li {
        margin-bottom: 10px;
      }
    }
  }

  .rating-display {
    display: flex;
    align-items: center;
    justify-content: center;

    .rating-value {
      font-weight: bold;
      font-size: 16px;
      color: #409EFF;
    }
  }
}
</style>
