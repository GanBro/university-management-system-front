<template>
  <el-card class="consultation-card">
    <div class="card-header">
      <span class="title">
        <i class="el-icon-chat-dot-round"></i>
        互动咨询
      </span>
    </div>

    <div class="consultation-list">
      <div v-for="(item, index) in consultations" :key="index" class="consultation-item">
        <div class="question" @click="handleQuestionClick(item)">{{ item.title }}</div>
        <div class="meta-info">
          <span class="user">{{ formatUser(item.user_id) }}</span>
          <span class="time">{{ formatTime(item.created_at) }}</span>
        </div>
      </div>

      <div v-if="consultations.length === 0" class="empty-text">
        暂无咨询内容
      </div>
    </div>

    <div class="actions">
      <el-button type="primary" size="medium" @click="handleAsk">我要咨询</el-button>
    </div>

    <!-- 使用 InteractionDetailDialog 组件 -->
    <InteractionDetailDialog
      :visible.sync="detailDialogVisible"
      :currentInteraction="currentConsultation"
      @reply="handleReply"
    />

    <!-- 咨询表单对话框 -->
    <el-dialog
      title="发起咨询"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="consultationForm" :model="consultationForm" :rules="rules">
        <el-form-item prop="title" label="标题">
          <el-input v-model="consultationForm.title" placeholder="请输入咨询标题"></el-input>
        </el-form-item>
        <el-form-item prop="content" label="内容">
          <el-input
            type="textarea"
            v-model="consultationForm.content"
            :rows="4"
            placeholder="请输入咨询内容"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitConsultation">提交</el-button>
      </span>
    </el-dialog>
  </el-card>
</template>

<script>
import moment from 'moment';
import { mapState } from 'vuex';
import { getToken } from '@/utils/auth';
import InteractionDetailDialog from './InteractionDetailDialog.vue';

export default {
  name: 'ConsultationCard',
  components: {
    InteractionDetailDialog,
  },
  props: {
    universityId: {
      type: [String, Number],
      required: true,
    },
    consultations: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      dialogVisible: false,
      detailDialogVisible: false,
      currentConsultation: null,
      consultationForm: {
        title: '',
        content: '',
      },
      rules: {
        title: [
          { required: true, message: '请输入咨询标题', trigger: 'blur' },
          { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' },
        ],
        content: [
          { required: true, message: '请输入咨询内容', trigger: 'blur' },
          { min: 10, max: 500, message: '内容长度在 10 到 500 个字符', trigger: 'blur' },
        ],
      },
    };
  },
  computed: {
    ...mapState({
      currentUser: (state) => state.user.name,
    }),
  },
  methods: {
    async handleQuestionClick(item) {
      try {
        const result = await this.$store.dispatch('interaction/getDetail', item.id);
        this.currentConsultation = result.data;
        this.detailDialogVisible = true;
      } catch (error) {
        console.error('获取咨询详情失败:', error);
        this.$message.error('获取详情失败');
      }
    },
    handleAsk() {
      if (!this.currentUser || !getToken()) {
        this.$router.push({
          path: '/login',
          query: { redirect: this.$route.fullPath },
        });
        return;
      }
      this.dialogVisible = true;
    },
    formatUser(userId) {
      // TODO: 根据用户ID获取用户名，可以考虑使用 Vuex 存储用户信息
      return userId;
    },
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm');
    },
    async submitConsultation() {
      try {
        await this.$refs.consultationForm.validate();
        if (!getToken()) {
          this.$router.push('/login');
          return;
        }

        await this.$store.dispatch('user/getInfo');

        const consultationData = {
          universityId: this.universityId,
          userId: this.$store.state.user.id,
          title: this.consultationForm.title.trim(),
          content: this.consultationForm.content.trim(),
          status: 'pending',
          is_public: true,
        };

        await this.$store.dispatch('university/submitConsultation', {
          id: this.universityId,
          consultationData,
        });

        this.$message.success('提交成功');
        this.dialogVisible = false;
        this.resetForm();
      } catch (error) {
        console.error('提交失败:', error);
        this.$message.error('提交失败,请重试');
      }
    },
    resetForm() {
      if (this.$refs.consultationForm) {
        this.$refs.consultationForm.resetFields();
      }
      this.consultationForm = {
        title: '',
        content: '',
      };
    },
    async handleReply({ content, isOfficial }) {
      try {
        await this.$store.dispatch('interaction/replyInteraction', {
          id: this.currentConsultation.id,
          data: {
            content,
            isOfficial,
            userId: this.$store.state.user.id,
          },
        });
        this.$message.success('回复成功');

        // 刷新当前互动详情
        const result = await this.$store.dispatch('interaction/getDetail', this.currentConsultation.id);
        this.currentConsultation = result.data;
      } catch (error) {
        console.error('回复失败:', error);
        this.$message.error('回复失败');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.consultation-card {
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      i {
        color: #10b981;
      }
    }
  }

  .consultation-list {
    .consultation-item {
      padding: 12px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .question {
        color: #2563eb;
        cursor: pointer;
        margin-bottom: 8px;

        &:hover {
          color: #1d4ed8;
        }
      }

      .meta-info {
        display: flex;
        justify-content: space-between;
        color: #666;
        font-size: 12px;
      }
    }

    .empty-text {
      text-align: center;
      color: #999;
      padding: 20px 0;
    }
  }

  .actions {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }
}
</style>
