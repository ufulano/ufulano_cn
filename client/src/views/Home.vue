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
      
      <!-- 调试信息 -->
      <section class="debug-section" style="background: #f0f0f0; padding: 10px; margin: 10px; border-radius: 8px;">
        <p>调试信息:</p>
        <p>isLoggedIn: {{ userStore.isLoggedIn }}</p>
        <p>token: {{ userStore.token ? '存在' : '不存在' }}</p>
        <p>user: {{ userStore.user ? '存在' : '不存在' }}</p>
        <p>initialized: {{ userStore.initialized }}</p>
        <el-button @click="testLogin">测试登录状态</el-button>
        <el-button @click="forceReload" type="danger" size="small">强制重新加载</el-button>
      </section>
      
      <!-- 新建帖子卡片 -->
      <section v-if="debugLoginStatus" class="new-post-section">
        <el-card class="new-post-card">
          <div class="new-post-header">
            <el-avatar :src="userStore.avatar" size="large" />
            <div class="new-post-input-wrapper">
              <el-input
                v-model="newPostContent"
                type="textarea"
                :rows="3"
                placeholder="分享你的想法..."
                maxlength="500"
                show-word-limit
                class="new-post-input"
                @focus="showNewPostActions = true"
              />
            </div>
          </div>
          
          <!-- 图片预览 -->
          <div v-if="newPostImages.length > 0" class="new-post-images" :data-count="newPostImages.length">
            <div 
              v-for="(img, index) in newPostImages" 
              :key="index" 
              class="new-post-image-item"
            >
              <el-image :src="img" fit="cover" class="new-post-image" />
              <div class="new-post-image-remove" @click="removeNewPostImage(index)">
                <el-icon><Close /></el-icon>
              </div>
            </div>
          </div>
          
          <!-- 新建帖子操作栏 -->
          <div v-if="showNewPostActions" class="new-post-actions">
            <div class="new-post-tools">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                :on-change="onNewPostImageChange"
                accept="image/*"
                :limit="4"
                class="new-post-upload"
              >
                <el-button class="new-post-tool-btn">
                  <el-icon><PictureFilled /></el-icon>
                  图片
                </el-button>
              </el-upload>
              
              <el-popover placement="top" width="220" trigger="click">
                <template #reference>
                  <el-button class="new-post-tool-btn">😀</el-button>
                </template>
                <div class="emoji-panel">
                  <span 
                    v-for="emoji in emojiList" 
                    :key="emoji" 
                    class="emoji-item" 
                    @click="insertNewPostEmoji(emoji)"
                  >
                    {{ emoji }}
                  </span>
                </div>
              </el-popover>
              
              <el-input
                v-model="newPostTopics"
                placeholder="添加话题..."
                class="new-post-topics"
                size="small"
              />
            </div>
            
            <div class="new-post-publish">
              <el-select v-model="newPostVisibility" size="small" class="new-post-visibility">
                <el-option label="公开" value="public" />
                <el-option label="仅粉丝" value="follower" />
                <el-option label="仅自己" value="private" />
              </el-select>
              <el-button 
                type="primary" 
                @click="publishNewPost"
                :loading="publishingPost"
                :disabled="!newPostContent.trim()"
                class="new-post-publish-btn"
              >
                发布
              </el-button>
            </div>
          </div>
        </el-card>
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
          :images="post.images || []"
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
import { PictureFilled, Close } from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'
import PostCard from '../components/PostCard.vue'
import { fetchPosts, createPost } from '../api/post'
import { useUserStore } from '../store/user'

const userStore = useUserStore()
const search = ref('')
const posts = ref([])
const loading = ref(false)
const error = ref(false)
const searchLoading = ref(false)

// 调试用户登录状态
console.log('=== Home.vue 用户状态调试 ===')
console.log('userStore.isLoggedIn:', userStore.isLoggedIn)
console.log('userStore.token:', userStore.token ? '存在' : '不存在')
console.log('userStore.user:', userStore.user)

// 新建帖子相关数据
const newPostContent = ref('')
const newPostImages = ref([])
const newPostTopics = ref('')
const newPostVisibility = ref('public')
const showNewPostActions = ref(false)
const publishingPost = ref(false)

// 表情列表
const emojiList = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😍','😘','😜','😎','😭','😡','👍','👏','🎉','❤️','🔥','🌈','🐱','🐶','🍉','🍔','⚽','🏀','🚗','✈️','🎵','💡','⭐'
]

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

// 调试登录状态的计算属性
const debugLoginStatus = computed(() => {
  console.log('=== 调试登录状态 ===')
  console.log('userStore.isLoggedIn:', userStore.isLoggedIn)
  console.log('userStore.token:', userStore.token ? '存在' : '不存在')
  console.log('userStore.user:', userStore.user)
  console.log('userStore.initialized:', userStore.initialized)
  return userStore.isLoggedIn
})

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
  console.log('=== 开始加载帖子 ===')
  console.log('当前时间:', new Date().toISOString())
  console.log('loading状态:', loading.value)
  console.log('error状态:', error.value)
  
  loading.value = true
  error.value = false
  
  try {
    console.log('准备调用 fetchPosts API...')
    console.log('fetchPosts函数:', typeof fetchPosts)
    
    const response = await fetchPosts()
    console.log('API响应原始数据:', response)
    console.log('响应类型:', typeof response)
    console.log('是否为数组:', Array.isArray(response))
    
    if (Array.isArray(response)) {
      posts.value = response
      console.log('直接使用数组响应，帖子数量:', response.length)
    } else if (response && response.data) {
      posts.value = response.data
      console.log('使用response.data，帖子数量:', response.data.length)
    } else {
      posts.value = []
      console.log('响应格式异常，设置为空数组')
    }
    
    console.log('最终posts.value:', posts.value)
    console.log('=== 加载帖子成功 ===')
  } catch (e) {
    console.error('=== 加载帖子失败 ===')
    console.error('错误对象:', e)
    console.error('错误消息:', e.message)
    console.error('错误堆栈:', e.stack)
    console.error('错误响应:', e.response)
    console.error('错误状态:', e.response?.status)
    console.error('错误数据:', e.response?.data)
    
    error.value = true
    ElMessage.error(`加载失败: ${e.message || '请检查网络连接'}`)
  } finally {
    loading.value = false
    console.log('loading状态已重置为:', loading.value)
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

            // 测试登录状态
            const testLogin = () => {
              console.log('=== 测试登录状态 ===')
              console.log('userStore.isLoggedIn:', userStore.isLoggedIn)
              console.log('userStore.token:', userStore.token)
              console.log('userStore.user:', userStore.user)
              console.log('userStore.initialized:', userStore.initialized)
              
              // 检查 localStorage 原始数据
              console.log('=== localStorage 原始数据 ===')
              console.log('userStore:', localStorage.getItem('userStore'))
              console.log('token:', localStorage.getItem('token'))
              console.log('user:', localStorage.getItem('user'))
              
              // 尝试重新初始化
              userStore.initFromStorage()
              
              // 验证和修复用户数据
              const isValid = userStore.validateAndFixUserData()
              
              ElMessage.info(`登录状态: ${userStore.isLoggedIn ? '已登录' : '未登录'}, 数据验证: ${isValid ? '通过' : '失败'}`)
            }
            
            // 强制重新加载
            const forceReload = () => {
              const success = userStore.forceReload()
              ElMessage.info(`强制重新加载: ${success ? '成功' : '失败'}`)
            }

// 新建帖子相关方法
const onNewPostImageChange = (file) => {
  if (newPostImages.value.length >= 4) {
    ElMessage.warning('最多只能上传4张图片')
    return
  }
  
  const reader = new FileReader()
  reader.onload = e => {
    newPostImages.value.push(e.target.result)
  }
  reader.readAsDataURL(file.raw)
}

const removeNewPostImage = (index) => {
  newPostImages.value.splice(index, 1)
}

const insertNewPostEmoji = (emoji) => {
  newPostContent.value += emoji
}

const publishNewPost = async () => {
  if (!newPostContent.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  publishingPost.value = true
  try {
    const payload = {
      content: newPostContent.value,
      images: newPostImages.value,
      topics: newPostTopics.value.split(',').map(t => t.trim()).filter(Boolean),
      visibility: newPostVisibility.value
    }
    
    await createPost(payload)
    ElMessage.success('发布成功')
    
    // 重置表单
    newPostContent.value = ''
    newPostImages.value = []
    newPostTopics.value = ''
    newPostVisibility.value = 'public'
    showNewPostActions.value = false
    
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
  console.log('=== Home.vue onMounted ===')
  console.log('组件已挂载，开始加载帖子')
  console.log('当前路由:', window.location.href)
  console.log('当前时间:', new Date().toISOString())
  
  // 检查用户登录状态
  console.log('用户登录状态检查:', {
    isLoggedIn: userStore.isLoggedIn,
    token: userStore.token ? '存在' : '不存在',
    user: userStore.user,
    initialized: userStore.initialized
  })
  
  // 检查网络连接
  if (navigator.onLine) {
    console.log('网络连接正常')
  } else {
    console.warn('网络连接异常')
  }
  
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

.new-post-section {
  width: 60%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 24px;
}

.new-post-card {
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  border: none;
  background: var(--color-white);
}

.new-post-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.new-post-header .el-avatar {
  border: 2px solid var(--color-gray-light);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.new-post-header .el-avatar:hover {
  border-color: var(--color-blue);
  transform: scale(1.05);
}

.new-post-input-wrapper {
  flex: 1;
}

.new-post-input {
  border: none;
  resize: none;
}

.new-post-input :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 0;
  font-size: 16px;
  line-height: 1.6;
  min-height: 80px;
}

.new-post-images {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.new-post-images[data-count="1"] {
  grid-template-columns: 1fr;
  max-width: 300px;
}

.new-post-images[data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  max-width: 400px;
}

.new-post-images[data-count="3"] {
  grid-template-columns: repeat(3, 1fr);
  max-width: 450px;
}

.new-post-images[data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-width: 400px;
}

.new-post-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.new-post-image-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.new-post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-post-image-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.new-post-image-remove:hover {
  background: rgba(220, 53, 69, 0.9);
  transform: scale(1.1);
}

.new-post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--color-gray-light);
}

.new-post-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-post-tool-btn {
  border: none;
  background: transparent;
  color: var(--color-gray);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.new-post-tool-btn:hover {
  background: var(--color-gray-light);
  color: var(--color-blue);
}

.new-post-upload {
  display: inline-block;
}

.new-post-topics {
  width: 150px;
}

.new-post-topics :deep(.el-input__inner) {
  border: 1px solid var(--color-gray-light);
  border-radius: 6px;
}

.new-post-publish {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-post-visibility {
  width: 100px;
}

.new-post-publish-btn {
  background: var(--color-blue);
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.2s;
}

.new-post-publish-btn:hover {
  background: var(--color-blue-dark);
  transform: translateY(-1px);
}

.new-post-publish-btn:disabled {
  background: var(--color-gray);
  cursor: not-allowed;
  transform: none;
}

.emoji-panel {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  padding: 12px;
}

.emoji-item {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  text-align: center;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: var(--color-gray-light);
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
  .new-post-section,
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
  
  .new-post-header {
    gap: 12px;
  }
  
  .new-post-header .el-avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  .new-post-images {
    grid-template-columns: 1fr !important;
    max-width: 100% !important;
  }
  
  .new-post-tools {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .new-post-topics {
    width: 120px;
  }
  
  .new-post-publish {
    flex-direction: column;
    gap: 8px;
  }
  
  .new-post-visibility {
    width: 100%;
  }
}
</style> 