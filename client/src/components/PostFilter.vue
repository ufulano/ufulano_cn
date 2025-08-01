<template>
  <!-- 帖子过滤器组件 -->
  <div class="post-filter">
    <!-- 过滤标签组 -->
    <div class="filter-tabs">
      <el-radio-group v-model="currentFilter" @change="handleFilterChange">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="following">关注</el-radio-button>
        <el-radio-button v-if="showUserFilter" label="user">我的</el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- 排序和刷新操作 -->
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
/**
 * 帖子过滤器组件
 * 
 * 功能：
 * - 帖子过滤选项（全部/关注/我的）
 * - 帖子排序方式选择
 * - 刷新功能
 * - 条件显示用户过滤器
 * 
 * 特性：
 * - 响应式设计
 * - 事件驱动
 * - 加载状态显示
 * - 灵活的过滤选项
 */

import { ref, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  /** 是否显示用户过滤器 */
  showUserFilter: {
    type: Boolean,
    default: false
  },
  /** 刷新状态 */
  refreshing: {
    type: Boolean,
    default: false
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['filter-change', 'sort-change', 'refresh'])

// 组件内部状态
/** 当前选中的过滤器 */
const currentFilter = ref('all')
/** 当前排序方式 */
const sortBy = ref('time')

/**
 * 处理过滤器变化事件
 * 
 * @param {string} value - 新的过滤器值
 */
const handleFilterChange = (value) => {
  emit('filter-change', value)
}

/**
 * 处理排序方式变化事件
 * 
 * @param {string} value - 新的排序方式
 */
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