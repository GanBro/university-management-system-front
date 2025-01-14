<template>
  <el-card class="recommendation-count-card mb-4">
    <div class="card-header">
      <span class="title">专业推荐人数</span>
      <el-tooltip content="专业被推荐次数统计" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <div class="more" @click="$emit('more')">更多&gt;</div>
    </div>

    <div class="rating-list">
      <div v-for="(item, index) in recommendationCounts" :key="index" class="rating-item">
        <span class="major-name">{{ item.name }}</span>
        <div class="rating-info">
          <span class="count">({{ item.count }}人)</span>
        </div>
      </div>

      <div v-if="recommendationCounts.length === 0" class="empty-text">
        暂无专业推荐数据
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'RecommendationCountCard',
  props: {
    recommendationCounts: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.recommendation-count-card {
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
