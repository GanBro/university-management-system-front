<!--src/views/university-admin/dashboard/index.vue-->
<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card shadow="hover" class="data-card">
          <div class="card-header">
            <span class="card-title">{{ card.title }}</span>
            <el-tooltip :content="card.tooltip" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="card-body">
            <div class="card-value">{{ card.value }}</div>
            <div v-if="card.trend" class="card-trend">
              <span :class="getTrendClass(card.trend)">
                <i :class="getTrendIcon(card.trend)"></i>
                {{ formatTrend(card.trend) }}
              </span>
              <span class="trend-label">{{ card.trendLabel }}</span>
            </div>
            <div v-if="card.subValue" class="sub-value">
              <span :class="card.subValueType">{{ card.subValue }}</span>
            </div>
            <div v-if="card.metric" class="card-metric">
              <el-progress
                :percentage="card.metric"
                :color="getProgressColor"
                :format="percentageFormat"
              ></el-progress>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 招生数据趋势图 -->
    <el-row :gutter="20" class="trend-section">
      <el-col :span="16">
        <el-card shadow="hover">
          <div slot="header" class="chart-header">
            <span>招生分数线趋势</span>
            <el-select v-model="selectedProvince" placeholder="选择省份" size="small">
              <el-option
                v-for="item in provinceOptions"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </div>
          <div id="admission-trend-chart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="rank-card">
          <div slot="header">
            <span>待处理咨询排行</span>
          </div>
          <div class="rank-list">
            <div v-for="(item, index) in pendingInteractions" :key="index" class="rank-item">
              <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
              <el-tooltip :content="item.title" placement="top">
                <span class="interaction-title">{{ item.title }}</span>
              </el-tooltip>
              <span class="time-ago">{{ item.timeAgo }}</span>
            </div>
            <div v-if="pendingInteractions.length === 0" class="empty-rank">
              <i class="el-icon-chat-dot-round"></i>
              <span>暂无待处理咨询</span>
            </div>
          </div>
          <div class="view-more">
            <router-link to="/university-admin/interaction">查看更多</router-link>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户行为分析 -->
    <el-row>
      <el-col :span="24">
        <el-card shadow="hover">
          <div slot="header">数据分析</div>
          <div class="analysis-tabs">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
              <el-tab-pane label="专业满意度" name="satisfaction">
                <div id="satisfaction-chart" style="height: 400px; width: 100%; min-height: 400px;"></div>
              </el-tab-pane>
              <el-tab-pane label="报考趋势" name="application">
                <div id="application-chart" style="height: 400px; width: 100%; min-height: 400px;"></div>
              </el-tab-pane>
              <el-tab-pane label="访问统计" name="visits">
                <div id="visits-chart" style="height: 400px; width: 100%; min-height: 400px;"></div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新动态 -->
    <el-row :gutter="20" class="activity-section">
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>最新咨询</span>
            <router-link to="/university-admin/interaction" class="header-link">
              查看全部
            </router-link>
          </div>
          <div class="timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in recentInteractions"
                :key="index"
                :type="getTimelineItemType(activity.status)"
                :timestamp="activity.time"
              >
                <div class="timeline-content">
                  <div class="timeline-title">{{ activity.title }}</div>
                  <div class="timeline-desc">{{ activity.content }}</div>
                  <div class="timeline-footer">
                    <span class="timeline-user">{{ activity.user }}</span>
                    <el-tag size="mini" :type="getStatusType(activity.status)">
                      {{ getStatusLabel(activity.status) }}
                    </el-tag>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <div slot="header">
            <span>最新新闻</span>
            <router-link to="/university-admin/news/list" class="header-link">
              查看全部
            </router-link>
          </div>
          <div class="news-list">
            <div v-for="(news, index) in recentNews" :key="index" class="news-item">
              <div class="news-item-title">{{ news.title }}</div>
              <div class="news-item-meta">
                <span class="publish-time">{{ news.publishTime }}</span>
                <span class="view-count">
                  <i class="el-icon-view"></i>
                  {{ news.viewCount }}
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'UniversityAdminDashboard',

  data() {
    return {
      loading: false,
      selectedProvince: '江苏省', // 默认省份
      activeTab: 'satisfaction',
      charts: {
        admissionTrendChart: null,
        satisfactionChart: null,
        applicationChart: null,
        visitsChart: null
      },
      // 模拟数据
      universityId: 1, // 假设当前是北京大学的管理员
      universityName: '北京大学',
      // 报考趋势数据
      applicationData: {
        years: ['2020', '2021', '2022', '2023', '2024', '2025'],
        applications: [15000, 16200, 17500, 18800, 20000, 21500],
        admissions: [2300, 2350, 2400, 2480, 2580, 2650]
      },
      // 访问统计数据
      visitsData: {
        days: ['8/1', '8/2', '8/3', '8/4', '8/5', '8/6', '8/7', '8/8', '8/9', '8/10', '8/11', '8/12', '8/13', '8/14'],
        values: [820, 932, 901, 934, 1290, 1330, 1320, 1250, 1100, 980, 1050, 1170, 1250, 1400]
      },
      // 用于清理定时器
      resizeTimers: []
    }
  },

  computed: {
    // 统计卡片数据
    statCards() {
      return [
        {
          title: '访问量',
          tooltip: '学校主页的访问量',
          value: '12,846',
          trend: 15.4,
          trendLabel: '较上月'
        },
        {
          title: '互动咨询',
          tooltip: '用户发起的互动咨询总数',
          value: '54',
          subValue: `待处理: 12`,
          subValueType: 'pending'
        },
        {
          title: '招生计划',
          tooltip: '今年招生计划完成情况',
          value: '2,580',
          metric: 98.5
        },
        {
          title: '平均满意度',
          tooltip: '用户对学校的平均满意度评分',
          value: '4.6分',
          trend: 0.2,
          trendLabel: '较上月'
        }
      ]
    },

    // 省份选项
    provinceOptions() {
      return ['北京市', '江苏省', '浙江省', '山东省']
    },

    // 待处理咨询
    pendingInteractions() {
      return [
        { title: '请问贵校计算机专业的就业方向有哪些？', timeAgo: '2小时前' },
        { title: '今年的招生计划是多少？', timeAgo: '5小时前' },
        { title: '有没有转专业的机会？', timeAgo: '1天前' },
        { title: '学校宿舍条件如何？', timeAgo: '2天前' },
        { title: '请问奖学金的申请条件是什么？', timeAgo: '2天前' }
      ]
    },

    // 最近互动
    recentInteractions() {
      return [
        {
          title: '关于奖学金的问题',
          content: '请问贵校特等奖学金的具体申请条件是什么？',
          user: '考生小王',
          status: 'pending',
          time: '2025-03-25 14:30'
        },
        {
          title: '专业调剂政策',
          content: '如果高考分数不够第一志愿专业，是否有调剂机会？',
          user: '考生家长',
          status: 'replied',
          time: '2025-03-24 09:15'
        },
        {
          title: '关于住宿问题',
          content: '请问宿舍是几人间？有独立卫浴吗？',
          user: '未来大学生',
          status: 'closed',
          time: '2025-03-23 16:42'
        }
      ]
    },

    // 最近发布的新闻
    recentNews() {
      return [
        {
          title: '北京大学2025年本科招生简章发布',
          publishTime: '2025-03-24',
          viewCount: 3245
        },
        {
          title: '我校学子在全国大学生创新创业大赛中获特等奖',
          publishTime: '2025-03-22',
          viewCount: 1856
        },
        {
          title: '关于2025年高考咨询会安排的通知',
          publishTime: '2025-03-20',
          viewCount: 2765
        },
        {
          title: '校长在开学典礼上的重要讲话',
          publishTime: '2025-03-15',
          viewCount: 1987
        }
      ]
    },

    // 进度条颜色
    getProgressColor() {
      return (percentage) => {
        if (percentage < 60) return '#F56C6C'
        if (percentage < 80) return '#E6A23C'
        return '#67C23A'
      }
    }
  },

  mounted() {
    // 延迟执行，确保DOM已加载
    setTimeout(() => {
      this.initMainCharts();
      // 初始化当前激活的标签页图表
      this.$nextTick(() => {
        this.initAllTabCharts();
      });
    }, 300);

    // 添加窗口大小变化监听
    window.addEventListener('resize', this.handleWindowResize);
  },

  beforeDestroy() {
    this.disposeCharts();
    window.removeEventListener('resize', this.handleWindowResize);

    // 清理所有定时器
    this.resizeTimers.forEach(timer => clearTimeout(timer));
  },

  methods: {
    // 初始化主要图表（分数线趋势）
    initMainCharts() {
      try {
        const admissionChartDom = document.getElementById('admission-trend-chart');
        if (admissionChartDom) {
          this.charts.admissionTrendChart = echarts.init(admissionChartDom);
          this.renderAdmissionTrendChart();
        } else {
          console.error('分数线趋势图表容器不存在');
        }
      } catch (error) {
        console.error('初始化主图表失败:', error);
      }
    },

    // 初始化所有标签页图表
    initAllTabCharts() {
      this.initTabChart('satisfaction');
      this.initTabChart('application');
      this.initTabChart('visits');
    },

    // 初始化标签页图表
    initTabChart(tabName) {
      try {
        console.log(`正在初始化${tabName}图表`);
        if (tabName === 'satisfaction') {
          const dom = document.getElementById('satisfaction-chart');
          if (dom) {
            if (!this.charts.satisfactionChart) {
              this.charts.satisfactionChart = echarts.init(dom);
              this.renderSatisfactionChart();
            } else {
              this.charts.satisfactionChart.resize();
            }
          }
        } else if (tabName === 'application') {
          const dom = document.getElementById('application-chart');
          if (dom) {
            if (!this.charts.applicationChart) {
              this.charts.applicationChart = echarts.init(dom);
              this.renderApplicationChart();
            } else {
              this.charts.applicationChart.resize();
            }
          } else {
            console.error('报考趋势图表容器不存在');
          }
        } else if (tabName === 'visits') {
          const dom = document.getElementById('visits-chart');
          if (dom) {
            if (!this.charts.visitsChart) {
              this.charts.visitsChart = echarts.init(dom);
              this.renderVisitsChart();
            } else {
              this.charts.visitsChart.resize();
            }
          } else {
            console.error('访问统计图表容器不存在');
          }
        }
      } catch (error) {
        console.error(`初始化${tabName}图表失败:`, error);
      }
    },

    // 强制调整图表大小
    forceResizeCharts() {
      if (this.activeTab === 'application' && this.charts.applicationChart) {
        this.charts.applicationChart.resize();
      } else if (this.activeTab === 'visits' && this.charts.visitsChart) {
        this.charts.visitsChart.resize();
      } else if (this.activeTab === 'satisfaction' && this.charts.satisfactionChart) {
        this.charts.satisfactionChart.resize();
      }
    },

    // 处理窗口大小变化
    handleWindowResize() {
      this.forceResizeCharts();
    },

    // 处理标签页点击事件
    handleTabClick(tab) {
      console.log('Tab clicked:', tab.name);

      // 立即初始化图表保证DOM更新
      this.initTabChart(tab.name);

      // 使用多次延迟调整尺寸解决首次渲染问题
      this.$nextTick(() => {
        if (tab.name === 'application' && this.charts.applicationChart) {
          this.charts.applicationChart.resize();

          // 清除之前的定时器
          this.resizeTimers.forEach(timer => clearTimeout(timer));
          this.resizeTimers = [];

          // 再次延迟调整大小
          const timer1 = setTimeout(() => {
            this.charts.applicationChart.resize();
          }, 200);
          this.resizeTimers.push(timer1);

          // 300ms后再次确认尺寸
          const timer2 = setTimeout(() => {
            this.charts.applicationChart.resize();
          }, 300);
          this.resizeTimers.push(timer2);

          // 500ms后最后确认一次
          const timer3 = setTimeout(() => {
            this.charts.applicationChart.resize();
          }, 500);
          this.resizeTimers.push(timer3);
        } else if (tab.name === 'visits' && this.charts.visitsChart) {
          this.charts.visitsChart.resize();

          // 清除之前的定时器
          this.resizeTimers.forEach(timer => clearTimeout(timer));
          this.resizeTimers = [];

          const timer1 = setTimeout(() => {
            this.charts.visitsChart.resize();
          }, 200);
          this.resizeTimers.push(timer1);

          const timer2 = setTimeout(() => {
            this.charts.visitsChart.resize();
          }, 300);
          this.resizeTimers.push(timer2);

          const timer3 = setTimeout(() => {
            this.charts.visitsChart.resize();
          }, 500);
          this.resizeTimers.push(timer3);
        }
      });
    },

    renderAdmissionTrendChart() {
      // 招生分数线趋势图
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['最低分数线', '平均分数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['2020', '2021', '2022', '2023', '2024', '2025']
        },
        yAxis: {
          type: 'value',
          name: '分数',
          min: 500
        },
        series: [
          {
            name: '最低分数线',
            type: 'line',
            data: [645, 655, 665, 680, 690, 695],
            smooth: true,
            lineStyle: {
              width: 3
            }
          },
          {
            name: '平均分数',
            type: 'line',
            data: [670, 678, 685, 695, 705, 710],
            smooth: true,
            lineStyle: {
              width: 3
            }
          }
        ]
      }

      this.charts.admissionTrendChart.setOption(option);
    },

    renderSatisfactionChart() {
      if (!this.charts.satisfactionChart) return;

      // 专业满意度图表
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['5分', '4分', '3分', '2分', '1分']
        },
        series: [
          {
            name: '满意度分布',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 45, name: '5分', itemStyle: { color: '#67C23A' } },
              { value: 35, name: '4分', itemStyle: { color: '#409EFF' } },
              { value: 15, name: '3分', itemStyle: { color: '#909399' } },
              { value: 4, name: '2分', itemStyle: { color: '#E6A23C' } },
              { value: 1, name: '1分', itemStyle: { color: '#F56C6C' } }
            ]
          }
        ]
      }

      this.charts.satisfactionChart.setOption(option);
    },

    renderApplicationChart() {
      if (!this.charts.applicationChart) return;

      // 报考趋势图表 - 完善配置解决显示问题
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['报考人数', '录取人数', '录取率'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: 50,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.applicationData.years,
          axisLabel: {
            interval: 0  // 确保显示所有x轴标签
          }
        },
        yAxis: [{
          type: 'value',
          name: '人数',
          min: 0,
          position: 'left',
          axisLabel: {
            formatter: '{value}'
          }
        }],
        series: [
          {
            name: '报考人数',
            type: 'bar',
            data: this.applicationData.applications,
            itemStyle: {
              color: '#409EFF'
            },
            barMaxWidth: 40,
            barGap: '20%'
          },
          {
            name: '录取人数',
            type: 'bar',
            data: this.applicationData.admissions,
            itemStyle: {
              color: '#67C23A'
            },
            barMaxWidth: 40
          },
          {
            name: '录取率',
            type: 'line',
            yAxisIndex: 0,
            data: this.applicationData.years.map((_, index) => {
              return (this.applicationData.admissions[index] / this.applicationData.applications[index] * 100).toFixed(1);
            }),
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#E6A23C'
            },
            lineStyle: {
              width: 3,
              type: 'dotted'
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%'
            }
          }
        ]
      };

      this.charts.applicationChart.setOption(option, true);

      // 强制重新调整图表大小以适应容器
      this.charts.applicationChart.resize();
    },

    renderVisitsChart() {
      if (!this.charts.visitsChart) return;

      // 访问统计图表
      const option = {
        title: {
          text: '近两周访问量统计',
          left: 'center',
          textStyle: {
            color: '#333',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: '{b}<br />{a0}: {c0}'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: this.visitsData.days,
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '访问量'
          }
        ],
        series: [
          {
            name: '访问量',
            type: 'line',
            stack: '总量',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(64, 158, 255, 0.8)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(64, 158, 255, 0.1)'
                  }
                ]
              }
            },
            emphasis: {
              focus: 'series'
            },
            data: this.visitsData.values,
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 3,
              color: '#409EFF'
            },
            itemStyle: {
              color: '#409EFF'
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值' },
                { type: 'min', name: '最小值' }
              ]
            }
          }
        ]
      }

      this.charts.visitsChart.setOption(option, true);
      this.charts.visitsChart.resize();
    },

    formatTrend(value) {
      if (!value) return '0%'
      return value > 0 ? `+${value}%` : `${value}%`
    },

    getTrendClass(value) {
      return {
        'trend-up': value > 0,
        'trend-down': value < 0,
        'trend-flat': value === 0
      }
    },

    getTrendIcon(value) {
      if (value > 0) return 'el-icon-top'
      if (value < 0) return 'el-icon-bottom'
      return 'el-icon-minus'
    },

    getRankClass(index) {
      const classes = ['rank-1', 'rank-2', 'rank-3']
      return index < 3 ? classes[index] : ''
    },

    percentageFormat(percentage) {
      return `${percentage}%`
    },

    getTimelineItemType(status) {
      const types = {
        pending: 'warning',
        replied: 'success',
        closed: 'info'
      }
      return types[status] || 'primary'
    },

    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        replied: 'success',
        closed: 'info'
      }
      return typeMap[status] || ''
    },

    getStatusLabel(status) {
      const labelMap = {
        pending: '待回复',
        replied: '已回复',
        closed: '已关闭'
      }
      return labelMap[status] || '未知状态'
    },

    disposeCharts() {
      Object.values(this.charts).forEach(chart => {
        if (chart) {
          try {
            chart.dispose();
          } catch (e) {
            console.error('图表销毁失败:', e);
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .dashboard-cards {
    margin-bottom: 20px;

    .data-card {
      height: 100%;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        .card-title {
          font-size: 14px;
          color: #606266;
        }

        .el-icon-info {
          color: #909399;
          cursor: help;
        }
      }

      .card-body {
        .card-value {
          font-size: 24px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 10px;
        }

        .card-trend {
          font-size: 13px;
          display: flex;
          align-items: center;

          .trend-up {
            color: #67C23A;
          }

          .trend-down {
            color: #F56C6C;
          }

          .trend-flat {
            color: #909399;
          }

          .trend-label {
            margin-left: 5px;
            color: #909399;
          }
        }

        .sub-value {
          font-size: 13px;
          color: #909399;
          margin-top: 8px;

          .pending {
            color: #E6A23C;
            font-weight: 500;
          }
        }

        .card-metric {
          margin-top: 15px;
        }
      }
    }
  }

  .trend-section {
    margin-bottom: 20px;

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
    }

    .rank-card {
      .rank-list {
        padding: 0 10px;

        .rank-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #EBEEF5;

          &:last-child {
            border-bottom: none;
          }

          .rank-number {
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            border-radius: 50%;
            margin-right: 10px;
            font-size: 12px;
            background: #f0f2f5;
            color: #606266;

            &.rank-1 {
              background: #F56C6C;
              color: white;
            }
            &.rank-2 {
              background: #E6A23C;
              color: white;
            }
            &.rank-3 {
              background: #67C23A;
              color: white;
            }
          }

          .interaction-title {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #606266;
          }

          .time-ago {
            margin-left: 10px;
            font-size: 12px;
            color: #909399;
          }
        }

        .empty-rank {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 0;
          color: #909399;

          i {
            font-size: 24px;
            margin-bottom: 10px;
          }
        }
      }

      .view-more {
        text-align: center;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #EBEEF5;

        a {
          color: #409EFF;
          text-decoration: none;
        }
      }
    }
  }

  .activity-section {
    margin-top: 20px;

    .header-link {
      float: right;
      color: #409EFF;
      font-size: 13px;
      text-decoration: none;
    }

    .timeline {
      padding: 10px;

      .timeline-content {
        padding: 0 10px;

        .timeline-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .timeline-desc {
          color: #606266;
          margin-bottom: 8px;
        }

        .timeline-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;

          .timeline-user {
            color: #909399;
          }
        }
      }
    }

    .news-list {
      padding: 10px;

      .news-item {
        padding: 15px 0;
        border-bottom: 1px solid #EBEEF5;

        &:last-child {
          border-bottom: none;
        }

        .news-item-title {
          font-weight: 500;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .news-item-meta {
          display: flex;
          justify-content: space-between;
          color: #909399;
          font-size: 12px;

          .view-count {
            display: flex;
            align-items: center;

            i {
              margin-right: 5px;
            }
          }
        }
      }
    }
  }
}
</style>
