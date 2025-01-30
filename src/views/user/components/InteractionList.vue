<template>
  <div class="interaction-list-section">
    <div class="action-buttons">
      <el-button type="primary" @click="handleCreate">新建互动</el-button>
    </div>

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
            <el-tag :type="getStatus(row.status, 'type')">{{ getStatus(row.status, 'label') }}</el-tag>
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

    <InteractionDetailDialog
      :visible.sync="detailDialogVisible"
      :currentInteraction="currentInteraction"
      :isAdmin="false"
      @reply="handleAddReply"
    />

    <el-dialog
      title="新建互动"
      :visible.sync="createDialogVisible"
      width="600px"
      @closed="resetForm"
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
            <div v-if="searchNoData" class="no-data-tip">{{ searchNoDataText }}</div>
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
        <el-button type="primary" @click="submitForm" :loading="submitLoading">提交</el-button>
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
import { searchUniversities } from '@/api/university';
import { mapGetters } from 'vuex';
import dayjs from 'dayjs';
import cloneDeep from 'lodash/cloneDeep';
import InteractionDetailDialog from '@/components/InteractionDetailDialog';

export default {
  name: 'InteractionList',
  components: {
    InteractionDetailDialog
  },

  data() {
    return {
      loading: false,
      interactionList: [],
      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        userId: null
      },
      createDialogVisible: false,
      detailDialogVisible: false,
      form: this.getInitialForm(),
      rules: this.getRules(),
      currentInteraction: null,
      submitLoading: false,
      universities: [],
      universityLoading: false,
      searchNoData: false,
      searchNoDataText: '未找到匹配高校',
      searchErrorTimeout: 5000,
      statusMapping: {
        pending: { label: '待回复', type: '' },
        replied: { label: '已回复', type: 'success' },
        closed: { label: '已关闭', type: 'info' }
      }
    };
  },

  computed: {
    ...mapGetters(['userId'])
  },

  created() {
    if (!this.userId) {
      this.$message.error('用户未登录');
      return;
    }
    this.listQuery.userId = this.userId;
    this.fetchData();
  },

  methods: {
    getInitialForm() {
      return {
        universityId: null,
        title: '',
        content: '',
        isPublic: true,
        userId: this.$store.getters.userId
      };
    },

    getRules() {
      return {
        universityId: [{ required: true, message: '请选择关联高校', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      };
    },

    checkUserLoggedIn() {
      if (!this.userId) {
        this.$message.error('用户未登录');
        return false;
      }
      return true;
    },

    async fetchWithTimeout(promise) {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('请求超时')), this.searchErrorTimeout);
      });
      return Promise.race([promise, timeout]);
    },

    async fetchData() {
      if (!this.checkUserLoggedIn()) return;

      this.loading = true;
      try {
        const { data } = await this.fetchWithTimeout(getInteractionList(this.listQuery));
        this.interactionList = data.records;
        this.total = data.total;
      } catch (error) {
        console.error('获取互动列表失败:', error);
        this.$message.error('获取列表失败');
      } finally {
        this.loading = false;
      }
    },

    async searchUniversity(query) {
      try {
        this.universityLoading = true;
        const { data } = await searchUniversities(query, 10);
        this.universities = data;
        this.searchNoData = data.length === 0;
        this.searchNoDataText = this.searchNoData
          ? query ? `未找到"${query}"相关高校` : '暂无高校数据'
          : '';
      } catch (error) {
        console.error('搜索失败:', error);
        this.$message.error('搜索失败');
      } finally {
        this.universityLoading = false;
      }
    },

    async handleSelectFocus() {
      // 用户点击时触发搜索，显示完整列表
      if (this.universities.length === 0) {
        this.searchUniversity('');
      }
    },

    resetForm() {
      this.$refs.form.resetFields();
      this.form = cloneDeep(this.getInitialForm());
      this.universities = [];
      this.searchNoData = false;
    },

    async submitForm() {
      if (!this.checkUserLoggedIn()) return;

      try {
        await this.$refs.form.validate();
        this.submitLoading = true;
        await this.fetchWithTimeout(createInteraction(this.form));
        this.$message.success('提交成功');
        this.createDialogVisible = false;
        this.fetchData();
      } catch (error) {
        console.error('提交失败:', error);
        this.$message.error('提交失败');
      } finally {
        this.submitLoading = false;
      }
    },

    async showDetail(row) {
      try {
        this.detailDialogVisible = true;
        const { data } = await this.fetchWithTimeout(getInteractionDetail(row.id));
        this.currentInteraction = data;
      } catch (error) {
        console.error('获取详情失败:', error);
        this.$message.error('获取详情失败');
      }
    },

    async handleAddReply(replyData) {
      try {
        await this.$store.dispatch('interaction/replyInteraction', {
          id: this.currentInteraction.id,
          data: {
            content: replyData.content,
            isOfficial: replyData.isOfficial,
            userId: parseInt(replyData.userId) // 确保转换为整数
          }
        })

        this.$message.success('回复成功')
        await this.showDetail(this.currentInteraction)
      } catch (error) {
        console.error('回复失败:', error)
        this.$message.error('回复失败')
      }
    },

    handleCreate() {
      if (!this.checkUserLoggedIn()) return;
      this.createDialogVisible = true;
    },

    handleSizeChange(val) {
      this.listQuery.limit = val;
      this.fetchData();
    },

    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.fetchData();
    },

    getStatus(status, key) {
      return this.statusMapping[status]?.[key] || '';
    },

    formatDateTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-';
    }
  }
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
