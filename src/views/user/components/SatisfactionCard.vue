<!--src/components/SatisfactionCard.vue-->
<template>
  <el-card class="satisfaction-card mb-4">
    <div class="card-header">
      <span class="title">院校满意度</span>
      <el-tooltip content="基于在校生及毕业生评价" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <div class="more" @click="$emit('more')">更多&gt;</div>
    </div>

    <div class="rating-circles">
      <div v-for="(item, index) in satisfactionRatings" :key="index" class="rating-circle">
        <el-progress
          type="circle"
          :percentage="getRatingPercentage(item.rating)"
          :stroke-width="8"
          :width="100"
          :color="getRatingColor(item.rating)"
        >
          <template slot="default">
            <div class="circle-content">
              <div v-if="item.rating > 0" class="rating">{{ item.rating.toFixed(1) }}</div>
              <div v-else class="rating no-rating">暂无</div>
              <div class="count">{{ item.count }}人评价</div>
            </div>
          </template>
        </el-progress>
        <div class="label">{{ item.label }}</div>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'SatisfactionCard',
  props: {
    satisfactionRatings: {
      type: Array,
      required: true
    }
  },
  methods: {
    getRatingPercentage(rating) {
      // 处理无评分或评分为0的情况
      if (!rating || rating <= 0) return 0;
      return rating * 20; // 转换为百分比
    },
    getRatingColor(rating) {
      if (!rating || rating <= 0) return '#909399'; // 灰色 - 无评分
      if (rating >= 4.5) return '#10b981';  // 绿色 - 极佳
      if (rating >= 4.0) return '#3b82f6';  // 蓝色 - 优秀
      if (rating >= 3.5) return '#f59e0b';  // 橙色 - 良好
      if (rating >= 3.0) return '#ec4899';  // 粉色 - 一般
      return '#ef4444';                     // 红色 - 较差
    }
  }
}
</script>

<style lang="scss" scoped>
.satisfaction-card {
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }

    .el-icon-info {
      margin-left: 4px;
      font-size: 14px;
      color: #999;
    }

    .more {
      margin-left: auto;
      color: #666;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .rating-circles {
    display: flex;
    justify-content: space-around;

    .rating-circle {
      text-align: center;

      .circle-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        .rating {
          font-size: 20px;
          font-weight: bold;
          color: #333;

          &.no-rating {
            font-size: 16px;
            font-weight: normal;
            color: #909399;
            font-style: italic;
          }
        }

        .count {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
        }
      }

      .label {
        margin-top: 8px;
        font-size: 14px;
        color: #666;
      }
    }
  }
}
</style>
