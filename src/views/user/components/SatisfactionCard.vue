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
          :percentage="item.rating * 20"
          :stroke-width="8"
          :width="100"
          :color="getRatingColor(item.rating)"
        >
          <template slot="default">
            <div class="circle-content">
              <div class="rating">{{ item.rating.toFixed(1) }}</div>
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
    getRatingColor(rating) {
      if (rating >= 4.5) return '#10b981'  // 绿色
      if (rating >= 4.0) return '#3b82f6'  // 蓝色
      return '#f59e0b'  // 橙色
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
