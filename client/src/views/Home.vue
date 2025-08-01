<template>
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

const userStore = useUserStore()
const posts = ref([])
const loading = ref(false)
const error = ref(false)
const searchLoading = ref(false)
const publishingPost = ref(false)
const page = ref(1)
const pageSize = 20

// 性能监控
const performanceMonitor = new PerformanceMonitor()

// 过滤帖子（搜索功能）
const filteredPosts = computed(() => {
  console.log('Home - 当前帖子数据:', posts.value?.length || 0, '条')
  console.log('Home - 帖子数据详情:', posts.value)
  if (posts.value && posts.value.length > 0) {
    console.log('Home - 第一个帖子:', posts.value[0])
    console.log('Home - 第一个帖子头像:', posts.value[0].avatar ? '存在' : '不存在')
  }
  return posts.value || []
})

const pagedPosts = computed(() => filteredPosts.value.slice(0, page.value * pageSize))

const handleScroll = (e) => {
  const el = e.target
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    if (pagedPosts.value.length < filteredPosts.value.length) {
      page.value++
    }
  }
}

// 加载帖子（带缓存）
const loadPosts = async () => {
  performanceMonitor.mark('loadPosts-start')
  
  // 临时禁用缓存，强制从API加载
  console.log('强制从API加载数据')
  
  // 检查缓存
  const cacheKey = 'posts_list'
  const cachedPosts = getCache(cacheKey)
  if (cachedPosts) {
    console.log('发现缓存数据，但跳过使用:', cachedPosts)
    // posts.value = cachedPosts
    // performanceMonitor.measure('loadPosts-cache', 'loadPosts-start')
    // return
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
    
    console.log('Home - API响应数据:', response)
    console.log('Home - 处理后的帖子数据:', postData)
    posts.value = postData
    
    // 缓存数据（5分钟）
    setCache(cacheKey, postData, 5 * 60 * 1000)
    
    performanceMonitor.measure('loadPosts-success', 'loadPosts-start')
  } catch (e) {
    console.error('加载帖子失败:', e)
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
    // 这里可以调用专门的搜索API，暂时使用本地过滤
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
  // TODO: 可以跳转到详情页或展开评论框
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
      console.log('发布缩略图模式')
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
    console.error('发布失败:', error)
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