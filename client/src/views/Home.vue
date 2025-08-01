<template>
  <!-- 首页组件 - 社交平台主页面 -->
  <div class="home-root">
    <AppHeader />
    <main class="home-main">
      <!-- 搜索栏 -->
      <SearchBar 
        :loading="searchLoading" 
        @search="handleSearch" 
      />
      
      <!-- 新建帖子卡片 -->
      <NewPostCard 
        v-if="userStore.isLoggedIn"
        :avatar="userStore.avatar"
        :publishing="publishingPost"
        @publish="publishNewPost"
      />
      
      <!-- 帖子流 -->
      <PostStream 
        :posts="pagedPosts"
        :loading="loading"
        :error="error"
        filter-mode="all"
        :current-user-id="null"
        @like="handleLike"
        @comment="handleComment"
        @repost="handleRepost"
        @reload="loadPosts"
      />
    </main>
  </div>
</template>

<script setup>
/**
 * Home 组件 - 首页
 * 功能：社交平台主页面，包含搜索、发帖、帖子流等功能
 * 特性：响应式布局、性能监控、智能缓存、无限滚动
 */

import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import SearchBar from '../components/SearchBar.vue'
import NewPostCard from '../components/NewPostCard.vue'
import PostStream from '../components/PostStream.vue'
import { fetchPosts, createPost } from '../api/post'
import { useUserStore } from '../store/user'
import { getCache, setCache, deleteCache, getCacheStats } from '../utils/cacheManager'
import { PerformanceMonitor } from '../utils/performance'

// 状态管理
const userStore = useUserStore()        // 用户状态管理
const posts = ref([])                   // 帖子数据
const loading = ref(false)              // 加载状态
const error = ref(false)                // 错误状态
const searchLoading = ref(false)        // 搜索加载状态
const publishingPost = ref(false)        // 发布帖子状态
const page = ref(1)                     // 当前页码
const pageSize = 20                     // 每页显示数量

// 性能监控实例
const performanceMonitor = new PerformanceMonitor()

// 过滤帖子（搜索功能）
const filteredPosts = computed(() => {
  return posts.value || []
})

// 分页帖子数据
const pagedPosts = computed(() => filteredPosts.value.slice(0, page.value * pageSize))

// 滚动加载更多
const handleScroll = (e) => {
  const el = e.target
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    if (pagedPosts.value.length < filteredPosts.value.length) {
      page.value++
    }
  }
}

// 加载帖子数据（带缓存）
const loadPosts = async () => {
  performanceMonitor.mark('loadPosts-start')
  
  // 检查缓存
  const cacheKey = 'posts_list'
  const cachedPosts = getCache(cacheKey)
  if (cachedPosts) {
    posts.value = cachedPosts
    performanceMonitor.measure('loadPosts-cache', 'loadPosts-start')
    return
  }
  
  loading.value = true
  error.value = false
  
  try {
    const response = await fetchPosts()
    
    let postData = []
    if (Array.isArray(response)) {
      postData = response
    } else if (response && response.data) {
      postData = response.data
    }
    
    posts.value = postData
    
    // 缓存数据（5分钟）
    setCache(cacheKey, postData, 5 * 60 * 1000)
    
    performanceMonitor.measure('loadPosts-success', 'loadPosts-start')
  } catch (e) {
    error.value = true
    ElMessage.error(`加载失败: ${e.message || '请检查网络连接'}`)
    performanceMonitor.measure('loadPosts-error', 'loadPosts-start')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = async (searchTerm) => {
  if (!searchTerm.trim()) {
    await loadPosts()
    return
  }
  
  searchLoading.value = true
  try {
    // TODO: 实现搜索功能，暂时使用本地过滤
    await loadPosts()
  } finally {
    searchLoading.value = false
  }
}

// 点赞处理
const handleLike = (post) => {
  // TODO: 调用点赞API
  ElMessage.success('点赞成功')
}

// 评论处理
const handleComment = (post) => {
  // TODO: 跳转到详情页或展开评论框
}

// 转发处理
const handleRepost = (post) => {
  // TODO: 调用转发API
  ElMessage.success('转发成功')
}

// 发布新帖子
const publishNewPost = async (payload) => {
  performanceMonitor.mark('publishPost-start')
  publishingPost.value = true
  
  try {
    // 检查是否是缩略图模式
    if (payload.isThumbnail) {
      ElMessage.info('正在发布...')
    }
    
    await createPost(payload)
    
    if (payload.isThumbnail) {
      ElMessage.success('发布成功！图片正在后台处理...')
    } else {
      ElMessage.success('发布成功')
    }
    
    // 清除缓存，重新加载帖子列表
    deleteCache('posts_list')
    await loadPosts()
    
    performanceMonitor.measure('publishPost-success', 'publishPost-start')
  } catch (error) {
    ElMessage.error('发布失败，请重试')
    performanceMonitor.measure('publishPost-error', 'publishPost-start')
  } finally {
    publishingPost.value = false
  }

}

onMounted(() => {
  loadPosts()
  const container = document.querySelector('.virtual-post-list')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.home-root {
  display: flex;
  flex-direction: column;
  background: var(--color-gray-light);
  overflow-x: hidden;
  box-sizing: border-box;
  min-height: 100vh;
}

.home-main {
  flex: 1 1 0;
  width: 100vw;
  background: var(--color-gray-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px 0;
  box-sizing: border-box;
  overflow-x: hidden;
}
</style> 