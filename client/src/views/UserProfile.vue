<template>
  <div class="user-profile-root">
    <AppHeader />
    
    <div class="user-profile-container">
      <!-- 左侧导航栏 -->
      <UserSidebar />

      <!-- 主内容区域 -->
      <main class="user-main">
        <!-- 返回按钮 -->
        <div class="back-button">
          <el-button @click="$router.back()" type="text">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>

        <!-- 用户信息卡片 -->
        <div class="user-info-card">
          <!-- 横幅图片 -->
          <div class="user-banner">
            <img src="https://picsum.photos/800/200" alt="用户横幅" />
          </div>
          
          <!-- 用户基本信息 -->
          <div class="user-info">
            <div class="user-avatar">
              <el-avatar :size="80" :src="userInfo.avatar_url || 'https://picsum.photos/80/80'" />
            </div>
            
            <div class="user-details">
              <h2 class="username">{{ userInfo.nickname || userInfo.username || '用户名' }}</h2>
              
              <div class="user-stats">
                <span class="stat-item">
                  <strong>{{ userInfo.fans_count || 0 }}</strong> 粉丝
                </span>
                <span class="stat-item">
                  <strong>{{ userInfo.follow_count || 0 }}</strong> 关注
                </span>
                <span class="stat-item">
                  <strong>{{ userInfo.post_count || 0 }}</strong> 动态
                </span>
              </div>
              
              <div class="user-bio">
                {{ userInfo.bio || '这个人很懒，什么都没有留下...' }}
              </div>
              
              <div class="user-location">
                <el-icon><Location /></el-icon>
                <span>IP属地: {{ userInfo.location || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容标签页 -->
        <div class="content-tabs">
          <el-tabs v-model="contentTab" class="user-tabs">
            <el-tab-pane label="精选" name="featured">
              <div class="tab-content">
                <div class="content-header">
                  <h3>精选内容</h3>
                  <el-input 
                    placeholder="搜索我的内容" 
                    prefix-icon="Search"
                    style="width: 200px;"
                  />
                </div>
                <div class="content-list">
                  <p>暂无精选内容</p>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="动态" name="posts">
              <div class="tab-content">
                <div class="content-header">
                  <h3>全部动态 ({{ posts.length }})</h3>
                  <el-input 
                    placeholder="搜索我的动态" 
                    prefix-icon="Search"
                    style="width: 200px;"
                  />
                </div>
                <div class="content-list">
                  <PostCard
                    v-for="post in posts"
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
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="视频" name="videos">
              <div class="tab-content">
                <div class="content-header">
                  <h3>我的视频</h3>
                </div>
                <div class="content-list">
                  <p>暂无视频内容</p>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="相册" name="albums">
              <div class="tab-content">
                <div class="content-header">
                  <h3>我的相册</h3>
                </div>
                <div class="content-list">
                  <p>暂无相册内容</p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  UserFilled, 
  Star, 
  ThumbsUp, 
  Setting, 
  ArrowLeft, 
  Location,
  Search
} from '@element-plus/icons-vue'
import AppHeader from '../components/AppHeader.vue'
import PostCard from '../components/PostCard.vue'
import UserSidebar from '../components/UserSidebar.vue'
import { useUserStore } from '../store/user'
import { fetchPosts } from '../api/post'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const activeTab = ref('profile')
const contentTab = ref('posts')
const posts = ref([])
const loading = ref(false)

// 用户信息
const userInfo = computed(() => {
  return userStore.user || {
    username: '用户名',
    nickname: '昵称',
    avatar_url: '',
    bio: '这个人很懒，什么都没有留下...',
    location: '未知',
    fans_count: 0,
    follow_count: 0,
    post_count: 0
  }
})

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

// 加载用户帖子
const loadUserPosts = async () => {
  loading.value = true
  try {
    const response = await fetchPosts()
    posts.value = Array.isArray(response) ? response : (response.data || [])
  } catch (error) {
    console.error('加载用户帖子失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleLike = (post) => {
  console.log('点赞帖子:', post.id)
  ElMessage.success('点赞成功')
}

const handleComment = (post) => {
  console.log('评论帖子:', post.id)
}

const handleRepost = (post) => {
  console.log('转发帖子:', post.id)
  ElMessage.success('转发成功')
}

onMounted(() => {
  loadUserPosts()
})
</script>

<style scoped>
.user-profile-root {
  min-height: 100vh;
  background: var(--color-gray-light);
  display: flex;
  flex-direction: column;
}

.user-profile-container {
  display: flex;
  max-width: 1200px;
  margin: 80px auto 0;
  gap: 24px;
  padding: 0 20px;
  flex: 1;
}



/* 主内容区域 */
.user-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-button {
  margin-bottom: 8px;
}

.back-button .el-button {
  color: var(--color-gray);
  font-size: 14px;
}

.back-button .el-button:hover {
  color: var(--color-blue);
}

/* 用户信息卡片 */
.user-info-card {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.user-banner {
  height: 200px;
  overflow: hidden;
  position: relative;
}

.user-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  padding: 0 24px 24px;
  position: relative;
}

.user-avatar {
  position: absolute;
  top: -40px;
  left: 24px;
  border: 4px solid var(--color-white);
  border-radius: 50%;
  box-shadow: var(--shadow-card);
}

.user-details {
  margin-top: 60px;
}

.username {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-dark);
}

.user-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat-item {
  color: var(--color-gray);
  font-size: 14px;
}

.stat-item strong {
  color: var(--color-gray-dark);
  font-weight: 600;
}

.user-bio {
  color: var(--color-gray);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.user-location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gray);
  font-size: 12px;
}

/* 内容标签页 */
.content-tabs {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 24px;
}

.user-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.user-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray);
}

.user-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-blue);
}

.user-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-blue);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-gray-light);
}

.content-header h3 {
  margin: 0;
  color: var(--color-gray-dark);
  font-size: 18px;
  font-weight: 600;
}

.content-list {
  min-height: 200px;
}

.content-list p {
  text-align: center;
  color: var(--color-gray);
  font-size: 14px;
  margin: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-profile-container {
    flex-direction: column;
    padding: 0 16px;
  }
  
  .user-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .content-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style> 