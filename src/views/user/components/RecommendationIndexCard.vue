<!--src/views/user/components/RecommendationIndexCard.vue-->
<template>
  <el-card class="recommendation-index-card mb-4">
    <div class="card-header">
      <span class="title">专业推荐指数</span>
      <el-tooltip content="基于专业推荐度评分" placement="top">
        <i class="el-icon-info"></i>
      </el-tooltip>
      <div class="more" @click="$emit('more')">更多&gt;</div>
    </div>

    <div class="rating-list">
      <div v-for="(item, index) in recommendationIndex" :key="index" class="rating-item">
        <span class="major-name">{{ item.name }}</span>
        <div class="rating-info">
          <span class="rating">{{ item.rating.toFixed(1) }}</span>
          <span class="count">({{ item.count }}人)</span>
        </div>
      </div>

      <div v-if="recommendationIndex.length === 0" class="empty-text">
        暂无专业推荐指数数据
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'RecommendationIndexCard',
  props: {
    recommendationIndex: {
      type: Array,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.recommendation-index-card {
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
