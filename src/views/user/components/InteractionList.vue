<!-- src/views/user/components/InteractionList.vue -->
<template>
  <div class="interaction-list-section">
    <!-- 新建互动按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="handleCreate">新建互动</el-button>
    </div>

    <!-- 互动列表 -->
    <div class="my-interactions">
      <h3>我的互动记录</h3>
      <el-table
        v-loading="loading"
        :data="interactionList"
        border
        style="width: 100%"
      >
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template slot-scope="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="时间" width="160" align="center">
          <template slot-scope="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" @click="showDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next"
          :total="total"
        />
      </div>
    </div>

    <!-- 互动详情弹窗 -->
    <InteractionDetailDialog
      :visible.sync="detailDialogVisible"
      :currentInteraction="currentInteraction"
      :isAdmin="false"
      @reply="handleAddReply"
    />

    <!-- 新建互动弹窗 -->
    <el-dialog
      title="新建互动"
      :visible.sync="createDialogVisible"
      width="600px"
      @closed="handleDialogClose"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="关联高校" prop="universityId">
          <el-select
            v-model="form.universityId"
            filterable
            remote
            reserve-keyword
            placeholder="输入高校名称搜索"
            :remote-method="searchUniversity"
            :loading="universityLoading"
            @focus="handleSelectFocus"
          >
            <el-option
              v-for="uni in universities"
              :key="uni.id"
              :label="uni.name"
              :value="uni.id"
            />
            <div v-if="searchNoData" class="no-data-tip">
              {{ searchNoDataText }}
            </div>
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input
            type="textarea"
            v-model="form.content"
            :rows="4"
            placeholder="请详细描述您的问题或想法"
          />
        </el-form-item>

        <el-form-item label="是否公开" prop="isPublic">
          <el-switch v-model="form.isPublic" />
          <span class="tip">公开的内容其他用户可见</span>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="submitForm"
          :loading="submitLoading"
        >提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getInteractionList,
  getInteractionDetail,
  createInteraction,
  replyInteraction
} from '@/api/interaction';
import { mapGetters } from 'vuex';
import dayjs from 'dayjs';
import InteractionDetailDialog from '@/components/InteractionDetailDialog';
import { searchUniversities } from '@/api/university'

export default {
  name: 'InteractionList',
  components: {
    InteractionDetailDialog,
  },
  data() {
    return {
      loading: false,
      interactionList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        userId: null,
      },
      createDialogVisible: false,
      detailDialogVisible: false,
      form: this.getInitialForm(),
      rules: {
        universityId: [{
          required: true,
          message: '请选择关联高校',
          trigger: 'change'
        }],
        title: [{
          required: true,
          message: '请输入标题',
          trigger: 'blur'
        }],
        content: [{
          required: true,
          message: '请输入内容',
          trigger: 'blur'
        }],
      },
      currentInteraction: null,
      submitLoading: false,
      universities: [],
      universityLoading: false,
      searchTimer: null,
      searchNoData: false,
      searchNoDataText: '未找到匹配高校',
    };
  },
  computed: {
    ...mapGetters(['userId']),
  },
  created() {
    this.listQuery.userId = this.userId;
    this.fetchData();
  },
  methods: {
    // 初始化表单
    getInitialForm() {
      return {
        universityId: null,
        title: '',
        content: '',
        isPublic: true,
        userId: this.$store.getters.userId
      };
    },

    // 触发新建弹窗显示
    handleCreate() {
      this.createDialogVisible = true;
    },

    // 获取互动列表
    async fetchData() {
      this.loading = true;
      try {
        const { data } = await getInteractionList(this.listQuery);
        this.interactionList = data.records;
        this.total = data.total;
      } catch (error) {
        console.error('获取互动列表失败:', error);
        this.$message.error('获取列表失败');
      } finally {
        this.loading = false;
      }
    },

    // 高校搜索（带防抖）
    searchUniversity(query) {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(async () => {
        try {
          this.universityLoading = true;
          const { data } = await searchUniversities(query, 10); // 直接调用导入的API方法
          this.universities = data;
          this.searchNoData = data.length === 0;
          this.searchNoDataText = this.searchNoData
            ? query ? `未找到"${query}"相关高校` : '暂无高校数据'
            : '';
        } catch (error) {
          console.error('搜索失败:', error);
          this.$message.error('搜索失败: ' + (error.response?.data?.message || '请求异常'));
        } finally {
          this.universityLoading = false;
        }
      }, 300);
    },

    // 选择器获取焦点时加载默认数据
    async handleSelectFocus() {
      if (this.universities.length === 0) {
        await this.searchUniversity('');
      }
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.form.validate();
        if (!this.form.userId) {
          this.form.userId = this.$store.getters.userId; // 确保提交时userId存在
        }
        this.submitLoading = true;
        await createInteraction(this.form);
        this.$message.success('提交成功');
        this.createDialogVisible = false;
        this.fetchData();
      } catch (error) {
        console.error('创建失败:', error);
        const errorMsg = error.response?.data?.message || '提交失败';
        this.$message.error(errorMsg);
      } finally {
        this.submitLoading = false;
      }
    },

    // 弹窗关闭时重置状态
    handleDialogClose() {
      this.$refs.form.resetFields();
      this.form = this.getInitialForm(); // 重置表单时重新获取初始值
      this.universities = [];
      this.searchNoData = false;
    },

    // 查看详情
    async showDetail(row) {
      try {
        const { data } = await getInteractionDetail(row.id);
        this.currentInteraction = data;
        this.detailDialogVisible = true;
      } catch (error) {
        console.error('获取详情失败:', error);
        this.$message.error('获取详情失败');
      }
    },

    // 添加回复
    async handleAddReply({ content }) {
      try {
        await replyInteraction(this.currentInteraction.id, {
          content,
          userId: this.userId,
        });
        this.$message.success('回复成功');
        const { data } = await getInteractionDetail(this.currentInteraction.id);
        this.currentInteraction = data;
        this.fetchData();
      } catch (error) {
        console.error('回复失败:', error);
        this.$message.error('回复失败');
      }
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.fetchData();
    },

    // 页码变化
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.fetchData();
    },

    // 状态标签类型
    getStatusType(status) {
      const typeMap = {
        pending: '',
        replied: 'success',
        closed: 'info',
      };
      return typeMap[status];
    },

    // 状态显示文本
    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭',
      };
      return labelMap[status];
    },

    // 格式化时间
    formatDateTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-';
    }
  },
};
</script>

<style lang="scss" scoped>
.interaction-list-section {
  .action-buttons {
    margin-bottom: 20px;
  }

  .my-interactions {
    h3 {
      margin-bottom: 20px;
      font-size: 18px;
      color: #333;
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
    }
  }
}

.no-data-tip {
  padding: 10px;
  color: #999;
  text-align: center;
  font-size: 14px;
}

.tip {
  margin-left: 10px;
  color: #999;
  font-size: 12px;
}

.el-form-item__label {
  padding-right: 20px;
  font-weight: 500;
}

::v-deep .el-select-dropdown__wrap {
  max-height: 400px !important;
}
</style>
