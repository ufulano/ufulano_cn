<!--
 * 首页组件
 * 
 * 功能特性：
 * - 帖子流展示：显示用户关注的动态和推荐内容
 * - 发布新帖子：快速发布文字、图片、视频内容
 * - 内容过滤：支持按类型、时间、热度等筛选
 * - 无限滚动：高性能的虚拟滚动列表
 * - 实时更新：支持实时刷新和推送
 * 
 * 页面结构：
 * - 顶部：应用头部导航
 * - 左侧：用户侧边栏
 * - 主内容：帖子流和新帖子卡片
 * - 右侧：搜索栏和推荐内容
 * 
 * 技术实现：
 * - 虚拟滚动：使用VirtualPostList组件优化性能
 * - 状态管理：与用户store和帖子store集成
 * - 响应式设计：支持移动端和桌面端
 * - 性能优化：懒加载、缓存、防抖等
 -->
<template>
  <div class="home-root">
    <!-- 应用头部 -->
    <AppHeader />
    
    <div class="home-container">
      <!-- 左侧用户侧边栏 -->
      <UserSidebar />
      
      <!-- 主内容区域 -->
      <main class="home-main">
        <!-- 新帖子发布卡片 -->
        <NewPostCard @post-created="handlePostCreated" />
        
        <!-- 帖子过滤器 -->
        <PostFilter 
          v-model:filter="currentFilter"
          @filter-changed="handleFilterChanged"
        />
        
        <!-- 帖子流列表 -->
        <PostStream 
          :filter="currentFilter"
          :key="streamKey"
          @post-updated="handlePostUpdated"
        />
      </main>
      
      <!-- 右侧搜索栏 -->
      <SearchBar class="home-search" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import UserSidebar from '../components/UserSidebar.vue'
import NewPostCard from '../components/NewPostCard.vue'
import PostFilter from '../components/PostFilter.vue'
import PostStream from '../components/PostStream.vue'
import SearchBar from '../components/SearchBar.vue'
import { useUserStore } from '../store/user'

// 获取路由实例和用户store
const router = useRouter()
const userStore = useUserStore()

// 响应式状态管理
const currentFilter = ref('all')    // 当前过滤器类型
const streamKey = ref(0)            // 帖子流组件key，用于强制刷新

/**
 * 处理帖子创建事件
 * 
 * @param {Object} post - 新创建的帖子对象
 */
const handlePostCreated = (post) => {
  console.log('新帖子已创建:', post)
  // 刷新帖子流
  streamKey.value++
}

/**
 * 处理过滤器变更事件
 * 
 * @param {string} filter - 新的过滤器类型
 */
const handleFilterChanged = (filter) => {
  console.log('过滤器已变更:', filter)
  currentFilter.value = filter
}

/**
 * 处理帖子更新事件
 * 
 * @param {Object} post - 更新后的帖子对象
 */
const handlePostUpdated = (post) => {
  console.log('帖子已更新:', post)
}

// 组件挂载时的初始化逻辑
onMounted(() => {
  // 检查用户登录状态
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  console.log('首页组件已挂载')
})
</script>

<style scoped>
/* 首页根容器 */
.home-root {
  min-height: 100vh;
  background: var(--color-gray-light);
  display: flex;
  flex-direction: column;
}

/* 首页主容器 */
.home-container {
  display: flex;
  max-width: 1200px;
  margin: 80px auto 0;
  gap: 24px;
  padding: 0 20px;
  flex: 1;
}

/* 主内容区域 */
.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 600px;
}

/* 搜索栏样式 */
.home-search {
  width: 300px;
  position: sticky;
  top: 100px;
  height: fit-content;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .home-search {
    display: none;
  }
}

@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    padding: 0 16px;
  }
  
  .home-main {
    max-width: none;
  }
}
</style> 