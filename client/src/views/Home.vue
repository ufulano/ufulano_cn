<template>
  <!-- 首页组件 - 社交平台主页面 -->
  <div class="home-root">
    <AppHeader />
    <main class="home-main">
      <div class="center-container">
        
        <!-- 主内容区域 -->
        <div class="content-wrapper">
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
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * Home 组件 - 首页
 * 功能：社交平台主页面，包含搜索、发帖、帖子流等功能
 * 特性：响应式布局、性能监控、智能缓存、无限滚动
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import SearchBar from '../components/SearchBar.vue'
import NewPostCard from '../components/NewPostCard.vue'
import PostStream from '../components/PostStream.vue'
import { fetchPosts, createPost } from '../api/post'
import { useUserStore } from '../store/user'
import { getCache, setCache, deleteCache } from '../utils/cacheManager'
import { PerformanceMonitor } from '../utils/performance'

// 状态管理
const userStore = useUserStore()        // 用户状态管理
const posts = ref([])                   // 帖子数据
const loading = ref(false)              // 加载状态
const error = ref(false)                // 错误状态
const searchLoading = ref(false)        // 搜索加载状态
const publishingPost = ref(false)       // 发布帖子状态
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
const handleLike = async (data) => {
  try {
    // 如果是点赞成功后的回调，更新本地数据
    if (data && typeof data === 'object' && 'postId' in data) {
      // 更新帖子列表中的点赞状态和数量
      const postIndex = posts.value.findIndex(p => p.post_id === data.postId)
      if (postIndex !== -1) {
        posts.value[postIndex].like_count = data.likeCount
        // 这里可以添加更多状态更新逻辑
      }
      console.log('点赞状态已更新:', data)
    } else {
      // 点赞按钮点击事件，PostCard组件会处理点赞逻辑
      console.log('点赞按钮被点击:', data)
    }
  } catch (error) {
    console.error('点赞处理失败:', error)
    ElMessage.error('点赞处理失败')
  }
}

// 评论处理
const handleComment = (post) => {
  // TODO: 跳转到详情页或展开评论框
}

// 转发处理
const handleRepost = async (data) => {
  try {
    // 如果是转发成功后的回调，刷新帖子列表
    if (data && data.repostData) {
      // 清除缓存，重新加载帖子列表
      deleteCache('posts_list')
      await loadPosts()
      ElMessage.success('转发成功，已刷新动态')
    } else {
      // 转发按钮点击事件，PostCard组件会处理转发逻辑
      console.log('转发按钮被点击:', data)
    }
  } catch (error) {
    console.error('转发处理失败:', error)
    ElMessage.error('转发处理失败')
  }
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
  const container = document.querySelector('.home-main')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  const container = document.querySelector('.home-main')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.home-root {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  overflow-x: hidden;
}

.home-root::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 214, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(64, 191, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 214, 0, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.home-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 80px 0 24px 0;
  box-sizing: border-box;
  overflow-y: auto;
  width: 100%;
  min-height: calc(100vh - 64px);
  position: relative;
  z-index: 1;
}

.center-container {
  width: 100%;
  max-width: 1200px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 20px;
  box-sizing: border-box;
  margin: 0 auto;
  position: relative;
}


.content-wrapper {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
  margin: 0 auto;
  position: relative;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  background-clip: padding-box;
}

.content-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(45deg, 
    var(--color-blue) 0%, 
    var(--color-yellow) 25%, 
    var(--color-blue) 50%, 
    var(--color-yellow) 75%, 
    var(--color-blue) 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  z-index: -1;
}

.content-wrapper::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 26px;
  background: linear-gradient(45deg, 
    rgba(64, 191, 255, 0.3) 0%, 
    rgba(255, 214, 0, 0.3) 25%, 
    rgba(64, 191, 255, 0.3) 50%, 
    rgba(255, 214, 0, 0.3) 75%, 
    rgba(64, 191, 255, 0.3) 100%);
  background-size: 200% 200%;
  animation: gradientShift 3s ease-in-out infinite reverse;
  z-index: -2;
  filter: blur(8px);
  opacity: 0.6;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 响应式设计 */

@media (max-width: 768px) {
  .home-main {
    padding: 70px 0 16px 0;
  }
  
  .center-container {
    padding: 0 16px;
    max-width: 100%;
  }
  
  .content-wrapper {
    gap: 12px;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .home-main {
    padding: 60px 0 12px 0;
  }
  
  .center-container {
    padding: 0 12px;
    max-width: 100%;
  }
  
  .content-wrapper {
    gap: 8px;
    max-width: 100%;
  }
}
</style>
