<template>
  <div class="post-filter">
    <div class="filter-tabs">
      <el-radio-group v-model="currentFilter" @change="handleFilterChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="following">关注</el-radio-button>
        <el-radio-button v-if="showUserFilter" label="user">我的</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="filter-actions">
      <el-select v-model="sortBy" placeholder="排序方式" @change="handleSortChange">
        <el-option label="最新发布" value="time" />
        <el-option label="最多点赞" value="likes" />
        <el-option label="最多评论" value="comments" />
      </el-select>
      
      <el-button 
        type="primary" 
        :icon="Refresh" 
        @click="$emit('refresh')"
        :loading="refreshing"
      >
        刷新
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  showUserFilter: {
    type: Boolean,
    default: false
  },
  refreshing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['filter-change', 'sort-change', 'refresh'])

const currentFilter = ref('all')
const sortBy = ref('time')

const handleFilterChange = (value) => {
  emit('filter-change', value)
}

const handleSortChange = (value) => {
  emit('sort-change', value)
}
</script>

<style scoped>
.post-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-gray-light);
  margin-bottom: 16px;
}

.filter-tabs {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.el-select {
  width: 120px;
}
</style> 