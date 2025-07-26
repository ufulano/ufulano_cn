<template>
  <div class="home-root">
    <AppHeader />
    <main class="home-main">
      <section class="welcome-section">
        <h1 class="main-title"><span style="color:#222">Uf</span><span style="color:#FFD600">ula</span><span style="color:#222">no</span></h1>
        <div class="main-subtitle">·大脑切片机·</div>
        <div class="main-search">
          <el-input 
            placeholder="想要找到什么有趣的？" 
            class="search-input" 
            v-model="search" 
            @keyup.enter="handleSearch"
            clearable
          />
          <el-button class="search-btn" @click="handleSearch" :loading="searchLoading">
            {{ searchLoading ? '搜索中...' : '搜索' }}
          </el-button>
        </div>
      </section>
      
      <!-- 加载状态 -->
      <section v-if="loading" class="loading-section">
        <el-empty description="正在加载精彩内容..." :image-size="120">
          <el-button type="primary" @click="loadPosts">重新加载</el-button>
        </el-empty>
      </section>
      
      <!-- 错误状态 -->
      <section v-else-if="error" class="error-section">
        <el-empty description="加载失败，请重试" :image-size="120">
          <el-button type="primary" @click="loadPosts">重新加载</el-button>
        </el-empty>
      </section>
      
      <!-- 空状态 -->
      <section v-else-if="filteredPosts.length === 0" class="empty-section">
        <el-empty description="暂无内容" :image-size="120">
          <el-button type="primary" @click="$router.push('/post/new')">发布第一条动态</el-button>
        </el-empty>
      </section>
      
      <!-- 帖子列表 -->
      <section v-else class="post-list-section">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.id"
          :post-id="post.id"
          :avatar="post.avatar || post.User?.avatar_url"
          :username="post.username || post.User?.username || post.User?.nickname"
          :time="formatTime(post.createdAt || post.time)"
          :content="post.content"
          :images="post.images || (post.image_url ? [post.image_url] : [])"
          :like-count="post.likes || post.like_count || 0"
          :read-count="post.read_count || 0"
          @like="handleLike(post)"
          @comment="handleComment(post)"
          @repost="handleRepost(post)"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import PostCard from '../components/PostCard.vue'
import { fetchPosts } from '../api/post'

const search = ref('')
const posts = ref([])
const loading = ref(false)
const error = ref(false)
const searchLoading = ref(false)

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  return date.toLocaleDateString('zh-CN')
}

// 过滤帖子（搜索功能）
const filteredPosts = computed(() => {
  if (!search.value.trim()) return posts.value
  
  const searchTerm = search.value.toLowerCase()
  return posts.value.filter(post => {
    const content = (post.content || '').toLowerCase()
    const username = (post.username || post.User?.username || post.User?.nickname || '').toLowerCase()
    return content.includes(searchTerm) || username.includes(searchTerm)
  })
})

// 加载帖子
const loadPosts = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await fetchPosts()
    posts.value = Array.isArray(response) ? response : (response.data || [])
  } catch (e) {
    console.error('加载帖子失败:', e)
    error.value = true
    ElMessage.error('加载失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = async () => {
  if (!search.value.trim()) {
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
  console.log('点赞帖子:', post.id)
  // TODO: 调用点赞API
  ElMessage.success('点赞成功')
}

// 评论处理
const handleComment = (post) => {
  console.log('评论帖子:', post.id)
  // TODO: 可以跳转到详情页或展开评论框
}

// 转发处理
const handleRepost = (post) => {
  console.log('转发帖子:', post.id)
  // TODO: 调用转发API
  ElMessage.success('转发成功')
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

.main-title span {
  color: var(--color-black);
}

.main-title span:nth-child(2) {
  color: var(--color-yellow);
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

.loading-section,
.error-section,
.empty-section {
  width: 60%;
  max-width: 900px;
  margin: 32px auto;
  text-align: center;
}

.post-list-section {
  width: 60%;
  max-width: 900px;
  margin-top: 12px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 1200px) {
  .welcome-section, 
  .post-list-section,
  .loading-section,
  .error-section,
  .empty-section {
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