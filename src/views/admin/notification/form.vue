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
        style="max-width: 800px;"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入通知标题" />
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
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

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
            <el-option label="普通" :value="0" />
            <el-option label="重要" :value="1" />
            <el-option label="紧急" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="目标用户" prop="targetType">
          <el-select v-model="form.targetType" placeholder="请选择目标用户类型" style="width: 100%" @change="handleTargetTypeChange">
            <el-option label="所有用户" value="all" />
            <el-option label="指定角色" value="roles" />
            <el-option label="指定用户" value="users" />
          </el-select>
        </el-form-item>

        <!-- 根据目标类型显示不同的选择器 -->
        <el-form-item v-if="form.targetType === 'roles'" label="选择角色" prop="selectedRoles">
          <el-checkbox-group v-model="form.selectedRoles">
            <el-checkbox label="admin">系统管理员</el-checkbox>
            <el-checkbox label="university_admin">高校管理员</el-checkbox>
            <el-checkbox label="user">普通用户</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item v-if="form.targetType === 'users'" label="选择用户" prop="selectedUsers">
          <el-select
            v-model="form.selectedUsers"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户名搜索"
            :remote-method="remoteSearchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="item in userOptions"
              :key="item.userId"
              :label="item.username"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="通知状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择通知状态" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button v-if="form.status === 'draft'" type="success" @click="publishNotification">保存并发布</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createNotification, updateNotification, getNotificationDetail, publishNotification } from '@/api/notification'
import { searchUsers } from '@/api/user' // 假设有一个用户搜索API

export default {
  name: 'NotificationForm',
  data() {
    return {
      isEdit: false,
      form: {
        title: '',
        content: '',
        type: 'system', // 默认系统通知
        status: 'draft', // 默认为草稿
        priority: 0, // 默认普通优先级
        targetType: 'all', // 默认所有用户
        selectedRoles: [], // 选中的角色
        selectedUsers: [], // 选中的用户ID
        targetValues: '' // 将根据选择生成JSON字符串
      },
      rules: {
        title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
        type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择通知状态', trigger: 'change' }],
        targetType: [{ required: true, message: '请选择目标用户类型', trigger: 'change' }],
        selectedRoles: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.form.targetType === 'roles' && (!value || value.length === 0)) {
              callback(new Error('请至少选择一个角色'));
            } else {
              callback();
            }
          },
          trigger: 'change'
        }],
        selectedUsers: [{
          required: true,
          validator: (rule, value, callback) => {
            if (this.form.targetType === 'users' && (!value || value.length === 0)) {
              callback(new Error('请至少选择一个用户'));
            } else {
              callback();
            }
          },
          trigger: 'change'
        }]
      },
      userSearchLoading: false,
      userOptions: [] // 用户搜索结果
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
        const response = await getNotificationDetail(this.$route.params.id)
        if (response.code === 200) {
          const data = response.data
          this.form = {
            ...data,
            selectedRoles: [],
            selectedUsers: []
          }

          // 解析targetValues字段
          if (data.targetType === 'roles' && data.targetValues) {
            try {
              this.form.selectedRoles = JSON.parse(data.targetValues)
            } catch (e) {
              console.error('解析角色JSON失败:', e)
            }
          } else if (data.targetType === 'users' && data.targetValues) {
            try {
              this.form.selectedUsers = JSON.parse(data.targetValues)
              // 加载用户信息
              this.loadSelectedUsers()
            } catch (e) {
              console.error('解析用户JSON失败:', e)
            }
          }
        } else {
          this.$message.error(response.message || '获取通知详情失败')
        }
      } catch (error) {
        console.error('获取通知详情失败:', error)
        this.$message.error('获取通知详情失败')
      }
    },

    // 加载已选择的用户信息
    async loadSelectedUsers() {
      if (this.form.selectedUsers && this.form.selectedUsers.length > 0) {
        try {
          const response = await searchUsers({ userIds: this.form.selectedUsers.join(',') })
          if (response.code === 200) {
            this.userOptions = response.data || []
          }
        } catch (error) {
          console.error('加载已选用户失败:', error)
        }
      }
    },

    // 远程搜索用户
    async remoteSearchUsers(query) {
      if (query !== '') {
        this.userSearchLoading = true
        try {
          const response = await searchUsers({ keyword: query, limit: 20 })
          if (response.code === 200) {
            this.userOptions = response.data || []
          }
        } catch (error) {
          console.error('搜索用户失败:', error)
        } finally {
          this.userSearchLoading = false
        }
      } else {
        this.userOptions = []
      }
    },

    // 处理目标类型变化
    handleTargetTypeChange(value) {
      this.form.selectedRoles = []
      this.form.selectedUsers = []
      this.form.targetValues = ''
    },

    // 准备提交数据
    prepareFormData() {
      const formData = { ...this.form }

      // 根据目标类型处理targetValues
      if (formData.targetType === 'roles' && formData.selectedRoles && formData.selectedRoles.length > 0) {
        formData.targetValues = JSON.stringify(formData.selectedRoles)
      } else if (formData.targetType === 'users' && formData.selectedUsers && formData.selectedUsers.length > 0) {
        formData.targetValues = JSON.stringify(formData.selectedUsers)
      } else {
        formData.targetValues = ''
      }

      // 删除辅助字段
      delete formData.selectedRoles
      delete formData.selectedUsers

      return formData
    },

    async submitForm() {
      try {
        await this.$refs.form.validate()
        const formData = this.prepareFormData()

        let response
        if (this.isEdit) {
          response = await updateNotification(this.$route.params.id, formData)
        } else {
          response = await createNotification(formData)
        }

        if (response.code === 200) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功')
          this.$router.push('/notification/list')
        } else {
          throw new Error(response.message || '操作失败')
        }
      } catch (error) {
        console.error('表单提交失败:', error)
        this.$message.error(error.message || '操作失败，请重试')
      }
    },

    async publishNotification() {
      try {
        await this.$refs.form.validate()
        const formData = this.prepareFormData()
        formData.status = 'published' // 设置为已发布状态

        let response
        if (this.isEdit) {
          response = await updateNotification(this.$route.params.id, formData)
          if (response.code === 200) {
            // 如果更新成功，调用发布API
            const publishResponse = await publishNotification(this.$route.params.id)
            if (publishResponse.code === 200) {
              this.$message.success('通知已更新并发布')
              this.$router.push('/notification/list')
            } else {
              throw new Error(publishResponse.message || '发布失败')
            }
          } else {
            throw new Error(response.message || '更新失败')
          }
        } else {
          // 新建直接设置状态为published，会自动发布
          response = await createNotification(formData)
          if (response.code === 200) {
            this.$message.success('通知已创建并发布')
            this.$router.push('/notification/list')
          } else {
            throw new Error(response.message || '创建失败')
          }
        }
      } catch (error) {
        console.error('发布通知失败:', error)
        this.$message.error(error.message || '操作失败，请重试')
      }
    },

    cancel() {
      this.$router.push('/notification/list')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.el-select-dropdown__item {
  padding: 0 20px;
}

.el-form-item__content {
  line-height: 40px;
}
</style>
