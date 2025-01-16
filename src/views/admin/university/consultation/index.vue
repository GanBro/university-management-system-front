# src/views/admin/university/consultation/index.vue
<template>
  <div class="consultation-management">
    <el-card v-loading="loading">
      <div slot="header" class="clearfix">
        <span>咨询管理</span>
        <el-button-group style="float: right;">
          <el-button size="small" type="primary" @click="exportData">导出数据</el-button>
          <el-button size="small" type="primary" @click="showAnalysisDialog">数据分析</el-button>
        </el-button-group>
      </div>

      <!-- 数据概览 -->
      <el-row :gutter="20" class="data-overview">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-chat-dot-round"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalConsultations }}</div>
              <div class="stat-label">总咨询数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-message"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingConsultations }}</div>
              <div class="stat-label">待回复</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-timer"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.avgResponseTime }}小时</div>
              <div class="stat-label">平均响应时间</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon">
              <i class="el-icon-data-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.responseRate }}%</div>
              <div class="stat-label">咨询回复率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" ref="searchForm">
          <el-form-item label="咨询类型">
            <el-select v-model="searchForm.type" placeholder="请选择" clearable>
              <el-option label="专业咨询" value="major" />
              <el-option label="招生咨询" value="admission" />
              <el-option label="就业咨询" value="career" />
              <el-option label="其他咨询" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="请选择" clearable>
              <el-option label="待回复" value="pending" />
              <el-option label="已回复" value="replied" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 咨询列表 -->
      <el-table
        :data="consultationList"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="咨询标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="askerName" label="咨询人" width="120" />
        <el-table-column prop="createTime" label="提问时间" width="180" />
        <el-table-column prop="responseTime" label="回复时间" width="180" />
        <el-table-column prop="replierName" label="回复人" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleViewDetail(scope.row)"
            >查看</el-button>
            <el-button
              type="text"
              size="small"
              v-if="scope.row.status === 'pending'"
              @click="handleReply(scope.row)"
            >回复</el-button>
            <el-button
              type="text"
              size="small"
              v-if="scope.row.status === 'pending'"
              @click="handleClose(scope.row)"
            >关闭</el-button>
            <el-button
              type="text"
              size="small"
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
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        />
      </div>
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog
      title="回复咨询"
      :visible.sync="replyDialogVisible"
      width="600px"
    >
      <el-form :model="replyForm" :rules="replyRules" ref="replyForm" label-width="80px">
        <el-form-item label="问题标题" prop="title">
          <el-input v-model="replyForm.title" disabled />
        </el-form-item>
        <el-form-item label="问题内容" prop="content">
          <el-input type="textarea" v-model="replyForm.content" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="回复内容" prop="reply">
          <el-input
            type="textarea"
            v-model="replyForm.reply"
            :rows="4"
            placeholder="请输入回复内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitReply">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 数据分析对话框 -->
    <el-dialog
      title="咨询数据分析"
      :visible.sync="analysisDialogVisible"
      width="80%"
    >
      <div class="analysis-content">
        <!-- 趋势分析 -->
        <div class="analysis-section">
          <h3>咨询趋势分析</h3>
          <div class="chart-container" style="height: 400px">
            <!-- 趋势图表 -->
          </div>
        </div>

        <!-- 类型分布 -->
        <div class="analysis-section">
          <h3>咨询类型分布</h3>
          <div class="chart-container" style="height: 300px">
            <!-- 饼图 -->
          </div>
        </div>

        <!-- 响应时间分析 -->
        <div class="analysis-section">
          <h3>响应时间分析</h3>
          <div class="chart-container" style="height: 300px">
            <!-- 柱状图 -->
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ConsultationManagement',

  data() {
    return {
      loading: false,
      // 统计数据
      stats: {
        totalConsultations: 0,
        pendingConsultations: 0,
        avgResponseTime: 0,
        responseRate: 0
      },

      // 搜索表单
      searchForm: {
        type: '',
        status: '',
        timeRange: []
      },

      // 日期选择配置
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },

      // 列表数据
      consultationList: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedRows: [],

      // 对话框
      replyDialogVisible: false,
      analysisDialogVisible: false,

      // 回复表单
      replyForm: {
        id: null,
        title: '',
        content: '',
        reply: ''
      },
      replyRules: {
        reply: [
          { required: true, message: '请输入回复内容', trigger: 'blur' },
          { min: 5, max: 500, message: '回复内容长度在 5 到 500 个字符', trigger: 'blur' }
        ]
      }
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    async fetchData() {
      try {
        this.loading = true
        await Promise.all([
          this.fetchStats(),
          this.fetchConsultationList()
        ])
      } catch (error) {
        console.error('获取咨询数据失败:', error)
        this.$message.error('获取数据失败')
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      // TODO: 实现获取统计数据的接口
    },

    async fetchConsultationList() {
      // TODO: 实现获取咨询列表的接口
    },

    getTypeTagType(type) {
      const types = {
        major: 'primary',
        admission: 'success',
        career: 'warning',
        other: 'info'
      }
      return types[type] || 'info'
    },

    getTypeLabel(type) {
      const labels = {
        major: '专业咨询',
        admission: '招生咨询',
        career: '就业咨询',
        other: '其他咨询'
      }
      return labels[type] || '未知类型'
    },

    getStatusTagType(status) {
      const types = {
        pending: 'warning',
        replied: 'success',
        closed: 'info'
      }
      return types[status] || 'info'
    },

    getStatusLabel(status) {
      const labels = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭'
      }
      return labels[status] || '未知状态'
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchConsultationList()
    },

    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.handleSearch()
    },

    handleSelectionChange(val) {
      this.selectedRows = val
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.fetchConsultationList()
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchConsultationList()
    },

    handleViewDetail(row) {
      // TODO: 实现查看详情的跳转
    },

    handleReply(row) {
      this.replyForm = {
        id: row.id,
        title: row.title,
        content: row.content,
        reply: ''
      }
      this.replyDialogVisible = true
    },

    async submitReply() {
      this.$refs.replyForm.validate(async valid => {
        if (valid) {
          try {
            await this.$store.dispatch('interaction/replyConsultation', {
              id: this.replyForm.id,
              data: {
                userId: this.$store.state.user.id,
                content: this.replyForm.reply,
                isOfficial: true
              }
            })
            this.$message.success('回复成功')
            this.replyDialogVisible = false
            this.fetchConsultationList()
          } catch (error) {
            console.error('提交回复失败:', error)
            this.$message.error('回复失败，请重试')
          }
        }
      })
    },

    async handleClose(row) {
      try {
        await this.$confirm('确认关闭该咨询吗？', '提示', {
          type: 'warning'
        })
        await this.$store.dispatch('interaction/closeConsultation', row.id)
        this.$message.success('关闭成功')
        this.fetchConsultationList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('关闭咨询失败:', error)
          this.$message.error('关闭失败，请重试')
        }
      }
    },

    async handleDelete(row) {
      try {
        await this.$confirm('确认删除该咨询吗？删除后不可恢复！', '警告', {
          type: 'warning'
        })
        await this.$store.dispatch('interaction/deleteConsultation', row.id)
        this.$message.success('删除成功')
        this.fetchConsultationList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除咨询失败:', error)
          this.$message.error('删除失败，请重试')
        }
      }
    },

    exportData() {
      const params = {
        ...this.searchForm,
        startTime: this.searchForm.timeRange?.[0],
        endTime: this.searchForm.timeRange?.[1]
      }
      // TODO: 实现导出功能
    },

    showAnalysisDialog() {
      this.analysisDialogVisible = true
      this.$nextTick(() => {
        // TODO: 初始化分析图表
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.consultation-management {
  padding: 20px;

  .data-overview {
    margin-bottom: 30px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        background: rgba(64, 158, 255, 0.1);

        i {
          font-size: 24px;
          color: #409EFF;
        }
      }

      .stat-info {
        flex: 1;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }

  .search-bar {
    margin-bottom: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .pagination-container {
    text-align: center;
    margin-top: 20px;
  }

  .analysis-content {
    .analysis-section {
      margin-bottom: 30px;

      h3 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        padding-left: 10px;
        border-left: 4px solid #409EFF;
      }

      .chart-container {
        background: #f5f7fa;
        border-radius: 4px;
        padding: 20px;
      }
    }
  }
}
</style>
