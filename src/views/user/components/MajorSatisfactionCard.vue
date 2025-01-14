<template>
  <el-card class="major-satisfaction-card mb-4">
    <div class="card-header">
      <span class="title">专业满意度</span>
      <el-tooltip content="基于在校生及毕业生评价" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <div class="more" @click="$emit('more')">更多&gt;</div>
    </div>

    <div class="rating-list">
      <div v-for="(item, index) in majorSatisfaction" :key="index" class="rating-item">
        <span class="major-name">{{ item.name }}</span>
        <div class="rating-info">
          <span class="rating">{{ item.rating.toFixed(1) }}</span>
          <span class="count">({{ item.count }}人)</span>
        </div>
      </div>

      <div v-if="majorSatisfaction.length === 0" class="empty-text">
        暂无专业满意度数据
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'MajorSatisfactionCard',
  props: {
    majorSatisfaction: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.major-satisfaction-card {
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

  .rating-list {
    .rating-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .major-name {
        font-size: 14px;
        color: #333;
      }

      .rating-info {
        .rating {
          font-size: 14px;
          font-weight: bold;
          color: #10b981;
          margin-right: 4px;
        }

        .count {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .empty-text {
      text-align: center;
      color: #999;
      padding: 20px 0;
    }
  }
}
</style>
