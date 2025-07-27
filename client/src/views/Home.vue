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
        :posts="filteredPosts"
        :loading="loading"
        :error="error"
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

const userStore = useUserStore()
const posts = ref([])
const loading = ref(false)
const error = ref(false)
const searchLoading = ref(false)
const publishingPost = ref(false)

// 过滤帖子（搜索功能）
const filteredPosts = computed(() => {
  console.log('Home - 当前帖子数据:', posts.value?.length || 0, '条')
  if (posts.value && posts.value.length > 0) {
    console.log('Home - 第一个帖子头像:', posts.value[0].avatar ? '存在' : '不存在')
  }
  return posts.value || []
})

// 加载帖子
const loadPosts = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await fetchPosts()
    
    if (Array.isArray(response)) {
      posts.value = response
    } else if (response && response.data) {
      posts.value = response.data
    } else {
      posts.value = []
    }
  } catch (e) {
    console.error('加载帖子失败:', e)
    error.value = true
    ElMessage.error(`加载失败: ${e.message || '请检查网络连接'}`)
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
  publishingPost.value = true
  try {
    await createPost(payload)
    ElMessage.success('发布成功')
    
    // 重新加载帖子列表
    await loadPosts()
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请重试')
  } finally {
    publishingPost.value = false
  }
}

onMounted(() => {
  loadPosts()
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