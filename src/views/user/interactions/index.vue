<template>
  <div class="user-interactions">
    <el-card>
      <interaction-list />
    </el-card>
  </div>
</template>

<script>
import InteractionList from '../components/InteractionList.vue'

export default {
  name: 'UserInteractions',
  components: {
    InteractionList
  }
}
</script>

<style lang="scss" scoped>
.user-interactions {
  padding: 20px;
}
</style>
