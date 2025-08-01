<template>
  <!-- 欢迎区域和搜索栏 -->
  <section class="welcome-section">
    <!-- 网站标题 -->
    <h1 class="main-title">
      <span style="color:#222">Uf</span>
      <span style="color:#FFD600">ula</span>
      <span style="color:#222">no</span>
    </h1>
    <!-- 副标题 -->
    <div class="main-subtitle">·大脑切片机·</div>
    <!-- 搜索区域 -->
    <div class="main-search">
      <el-input 
        placeholder="想要找到什么有趣的？" 
        class="search-input" 
        v-model="searchValue" 
        @keyup.enter="handleSearch"
        clearable
      />
      <el-button class="search-btn" @click="handleSearch" :loading="loading">
        {{ loading ? '搜索中...' : '搜索' }}
      </el-button>
    </div>
  </section>
</template>

<script setup>
/**
 * 搜索栏组件
 * 
 * 功能：
 * - 显示网站标题和副标题
 * - 提供搜索输入框
 * - 支持实时搜索（防抖）
 * - 支持回车键搜索
 * - 显示搜索状态
 * 
 * 特性：
 * - 响应式设计
 * - 防抖搜索优化
 * - 清空功能
 * - 加载状态显示
 */

import { ref, watch } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  /** 搜索加载状态 */
  loading: {
    type: Boolean,
    default: false
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['search'])

/** 搜索输入值 */
const searchValue = ref('')

/**
 * 处理搜索事件
 * 触发搜索事件并传递搜索值
 */
const handleSearch = () => {
  emit('search', searchValue.value)
}

/**
 * 监听搜索值变化，实时搜索
 * 使用300ms防抖优化性能
 */
watch(searchValue, (newValue) => {
  emit('search', newValue)
}, { debounce: 300 })
</script>

<style scoped>
.welcome-section {
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  padding: 36px 32px 28px 32px;
  margin-bottom: 32px;
  width: 60%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  background: var(--color-white);
}

.main-title {
  font-size: 2.8rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.main-subtitle {
  color: var(--color-blue);
  font-size: 1.3rem;
  margin-bottom: 24px;
}

.main-search {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
}

.search-input {
  width: 320px;
  border-radius: 4px 0 0 4px;
  background: var(--color-white);
  border: 1.5px solid var(--color-blue);
}

.search-btn {
  background: var(--color-blue);
  color: var(--color-white);
  border-radius: 0 4px 4px 0;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: var(--color-blue-dark);
  transform: translateY(-1px);
}

@media (max-width: 1200px) {
  .welcome-section {
    max-width: 98vw;
    width: 98vw;
    padding: 8px;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .search-input {
    width: 160px;
  }
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 24px 16px 20px 16px;
  }
  
  .main-title {
    font-size: 1.8rem;
  }
  
  .main-subtitle {
    font-size: 1.1rem;
  }
  
  .search-input {
    width: 120px;
  }
}
</style> 