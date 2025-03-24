<!-- src/views/university-admin/dashboard/index.vue -->
<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="welcome-card">
          <div class="welcome-header">
            <div class="welcome-avatar">
              <img src="https://img1.baidu.com/it/u=2743394743,692629981&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=800" alt="高校logo" class="university-logo">
            </div>
            <div class="welcome-info">
              <h2>欢迎使用高校管理系统</h2>
              <p class="university-name">北京大学管理员</p>
              <p class="last-login">上次登录：2025-03-24 09:12:27</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt20">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>高校信息概览</span>
          </div>
          <el-row :gutter="20" class="data-overview">
            <el-col :span="8">
              <div class="data-item">
                <div class="data-icon">
                  <i class="el-icon-user"></i>
                </div>
                <div class="data-info">
                  <div class="data-title">在校学生</div>
                  <div class="data-value">38,000</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="data-item">
                <div class="data-icon">
                  <i class="el-icon-s-custom"></i>
                </div>
                <div class="data-info">
                  <div class="data-title">教职工</div>
                  <div class="data-value">3,800</div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="data-item">
                <div class="data-icon">
                  <i class="el-icon-office-building"></i>
                </div>
                <div class="data-info">
                  <div class="data-title">校园面积</div>
                  <div class="data-value">3,800,000 m²</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>互动消息</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看更多</el-button>
          </div>
          <div class="interaction-list">
            <div v-for="(item, index) in interactionList" :key="index" class="interaction-item">
              <div class="interaction-title">{{ item.title }}</div>
              <div class="interaction-status" :class="{'status-pending': item.status === 'pending', 'status-replied': item.status === 'replied'}">
                {{ statusText[item.status] }}
              </div>
            </div>
            <div v-if="interactionList.length === 0" class="empty-data">
              暂无互动消息
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>最新公告</span>
            <el-button style="float: right; padding: 3px 0" type="text">查看更多</el-button>
          </div>
          <div class="news-list">
            <div v-for="(item, index) in newsList" :key="index" class="news-item">
              <div class="news-title">{{ item.title }}</div>
              <div class="news-date">{{ item.date }}</div>
            </div>
            <div v-if="newsList.length === 0" class="empty-data">
              暂无公告信息
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt20">
      <el-col :span="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>快捷功能</span>
          </div>
          <el-row :gutter="20" class="feature-cards">
            <el-col :span="8">
              <div class="feature-card">
                <i class="el-icon-edit"></i>
                <span>编辑高校信息</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-card">
                <i class="el-icon-chat-line-square"></i>
                <span>回复互动消息</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="feature-card">
                <i class="el-icon-document"></i>
                <span>发布招生信息</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'UniversityAdminDashboard',
  data() {
    return {
      interactionList: [
        { title: '关于2026年招生政策的咨询', status: 'pending' },
        { title: '请问贵校的计算机专业有哪些研究方向？', status: 'replied' },
        { title: '国际学生申请条件问题', status: 'pending' },
        { title: '关于转专业政策的问题', status: 'replied' }
      ],
      newsList: [
        { title: '2025年秋季学期教学工作安排通知', date: '2025-03-20' },
        { title: '关于开展2025年度优秀学生评选的通知', date: '2025-03-18' },
        { title: '2025年硕士研究生招生简章发布', date: '2025-03-15' },
        { title: '关于开展校园开放日活动的通知', date: '2025-03-10' }
      ],
      statusText: {
        'pending': '待回复',
        'replied': '已回复',
        'closed': '已关闭'
      }
    }
  },
  created() {
    // 这里可以调用API获取数据，目前使用静态数据
  },
  methods: {
    // 此处暂不实现方法
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.mt20 {
  margin-top: 20px;
}

.welcome-card {
  .welcome-header {
    display: flex;
    align-items: center;

    .welcome-avatar {
      margin-right: 20px;

      .university-logo {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid #eee;
      }
    }

    .welcome-info {
      h2 {
        margin: 0 0 10px 0;
        font-size: 24px;
        color: #303133;
      }

      .university-name {
        font-size: 18px;
        color: #409EFF;
        margin: 0 0 5px 0;
      }

      .last-login {
        font-size: 14px;
        color: #909399;
        margin: 0;
      }
    }
  }
}

.data-overview {
  .data-item {
    display: flex;
    align-items: center;
    background-color: #f5f7fa;
    border-radius: 4px;
    padding: 15px;
    height: 100px;

    .data-icon {
      width: 60px;
      height: 60px;
      background-color: #409EFF;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 15px;

      i {
        font-size: 30px;
        color: #fff;
      }
    }

    .data-info {
      flex: 1;

      .data-title {
        font-size: 14px;
        color: #606266;
        margin-bottom: 5px;
      }

      .data-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
    }
  }
}

.interaction-list, .news-list {
  .interaction-item, .news-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
    }

    .interaction-title, .news-title {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .interaction-status, .news-date {
      margin-left: 15px;
      font-size: 14px;
    }

    .status-pending {
      color: #E6A23C;
    }

    .status-replied {
      color: #67C23A;
    }
  }
}

.feature-cards {
  .feature-card {
    height: 120px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background-color: #ecf5ff;
      color: #409EFF;
    }

    i {
      font-size: 36px;
      margin-bottom: 10px;
    }

    span {
      font-size: 16px;
    }
  }
}

.empty-data {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
</style>
