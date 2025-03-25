<!--src/views/admin/notification/form.vue-->
<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? '编辑通知' : '发布新通知' }}</span>
      </div>

      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px;"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入通知标题" />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入通知内容"
          />
        </el-form-item>

        <el-form-item label="通知类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择通知类型" style="width: 100%">
            <el-option label="系统通知" value="system" />
            <el-option label="用户通知" value="user" />
            <el-option label="广播通知" value="broadcast" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createNotification, updateNotification, getNotificationDetail } from '@/api/notification'

export default {
  name: 'NotificationForm',
  data() {
    return {
      isEdit: false,
      form: {
        title: '',
        content: '',
        type: ''
      },
      rules: {
        title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
        type: [{ required: true, message: '请选择通知类型', trigger: 'change' }]
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
      try {
        const { data } = await getNotificationDetail(this.$route.params.id)
        this.form = data
      } catch (error) {
        console.error('获取通知详情失败:', error)
      }
    },
    async submitForm() {
      try {
        await this.$refs.form.validate()
        if (this.isEdit) {
          await updateNotification(this.$route.params.id, this.form)
          this.$message.success('更新成功')
        } else {
          await createNotification(this.form)
          this.$message.success('创建成功')
        }
        this.$router.push('/notification/list')
      } catch (error) {
        console.error('表单提交失败:', error)
      }
    },
    cancel() {
      this.$router.push('/notification/list')
    }
  }
}
</script>
