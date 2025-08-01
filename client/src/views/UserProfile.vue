<template>
  <!-- 用户个人主页根容器 -->
  <div class="user-profile-root">
    <!-- 顶部导航栏组件 -->
    <AppHeader />
    
    <!-- 用户个人主页内容容器 -->
    <div class="user-profile-container">
      <!-- 左侧用户侧边栏 -->
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
          <!-- 用户横幅图片 -->
          <div class="user-banner">
            <img src="https://picsum.photos/800/200" alt="用户横幅" />
          </div>
          
          <!-- 用户基本信息区域 -->
          <div class="user-info">
            <!-- 用户头像 -->
            <div class="user-avatar">
              <el-avatar :size="80" :src="parseAvatar(userInfo.avatar_url)" />
            </div>
            
            <!-- 用户详细信息 -->
            <div class="user-details">
              <!-- 用户名/昵称 -->
              <h2 class="username">{{ userInfo.nickname || userInfo.username || '用户名' }}</h2>
              
              <!-- 用户统计数据 -->
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
              
              <!-- 用户个人简介 -->
              <div class="user-bio">
                {{ userInfo.bio || '这个人很懒，什么都没有留下...' }}
              </div>
              
              <!-- 用户地理位置 -->
              <div class="user-location">
                <el-icon><Location /></el-icon>
                <span>IP属地: {{ userInfo.location || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 内容标签页区域 -->
        <div class="content-tabs">
          <!-- Element Plus 标签页组件 -->
          <el-tabs v-model="contentTab" class="user-tabs">
            <!-- 精选内容标签页 -->
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
            
            <!-- 用户动态标签页 -->
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
                <!-- 动态流组件 -->
                <div class="content-list">
                  <!-- 简单状态信息 -->
                  <div style="background: #f0f0f0; padding: 10px; margin-bottom: 10px; font-size: 12px;">
                    <p><strong>状态信息:</strong></p>
                    <p>帖子数量: {{ posts.length }}</p>
                    <p>加载状态: {{ loading }}</p>
                    <p>错误状态: {{ error }}</p>
                    <p>用户ID: {{ route.params.id || userStore.userId }}</p>
                  </div>
                  
                                     <PostStream 
                     :posts="posts"
                     :loading="loading"
                     :error="error"
                     filter-mode="user"
                     :current-user-id="route.params.id || userStore.userId"
                     :page-size="10"
                     @like="handleLike"
                     @comment="handleComment"
                     @repost="handleRepost"
                     @reload="loadUserPosts"
                   />
                </div>
              </div>
            </el-tab-pane>
            
            <!-- 视频内容标签页 -->
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
            
            <!-- 相册内容标签页 -->
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
// Vue 相关导入
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// Element Plus 图标导入
import { 
  User, 
  UserFilled, 
  Star, 
  StarFilled, 
  Setting, 
  ArrowLeft, 
  Location,
  Search
} from '@element-plus/icons-vue'

// 组件导入
import AppHeader from '../components/AppHeader.vue'
import PostCard from '../components/PostCard.vue'
import PostStream from '../components/PostStream.vue'
import UserSidebar from '../components/UserSidebar.vue'

// 状态管理和工具函数导入
import { useUserStore } from '../store/user'
import { fetchPosts } from '../api/post'
import { getUserPosts } from '../api/user'
import { parseAvatar } from '../utils/avatar'

// 路由相关初始化
const route = useRoute()  // 获取当前路由信息
const router = useRouter()  // 获取路由实例
const userStore = useUserStore()  // 获取用户状态管理

// 响应式数据定义
const activeTab = ref('profile')  // 当前活动标签页
const contentTab = ref('posts')   // 内容标签页默认选中
const posts = ref([])             // 用户动态列表
const loading = ref(false)        // 加载状态
const error = ref(false)          // 错误状态

// 调试：检查API函数是否存在
console.log('API函数检查:', {
  fetchPosts: typeof fetchPosts,
  getUserPosts: typeof getUserPosts,
  userStore: userStore,
  route: route
})

// 计算属性：获取用户信息
const userInfo = computed(() => {
  return userStore.user || {  // 如果store中没有用户数据，返回默认值
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

/**
 * 格式化时间显示
 * @param {string} timeStr - 时间字符串
 * @returns {string} 格式化后的时间
 */
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

/**
 * 加载用户动态
 */
const loadUserPosts = async () => {
  loading.value = true  // 开始加载
  error.value = false   // 重置错误状态
  try {
    // 获取当前用户ID
    const userId = route.params.id || userStore.userId
    console.log('加载用户帖子，用户ID:', userId)
    console.log('当前路由参数:', route.params)
    console.log('用户Store状态:', userStore.user)
    
    if (userId) {
      // 使用专门的用户动态API
      const response = await getUserPosts(userId)
      console.log('API响应原始数据:', response)
      // 后端返回格式: { posts: [...], pagination: {...} }
      let rawPosts = response.posts || response.data || []
      console.log('原始帖子数据:', rawPosts)
      
      // 过滤掉无效的帖子，但放宽条件
      posts.value = rawPosts.filter(post => post && typeof post === 'object')
      console.log('过滤后的有效帖子:', posts.value)
      
      // 如果有无效数据，记录警告
      if (rawPosts.length !== posts.value.length) {
        console.warn('发现无效帖子数据:', rawPosts.filter(post => !post || typeof post !== 'object'))
      }
    } else {
      // 如果没有用户ID，获取所有动态
      const response = await fetchPosts()
      console.log('获取所有帖子响应:', response)
      let rawPosts = Array.isArray(response) ? response : (response.data || [])
      console.log('原始所有帖子数据:', rawPosts)
      
      // 过滤掉无效的帖子，但放宽条件
      posts.value = rawPosts.filter(post => post && typeof post === 'object')
      console.log('过滤后的有效帖子:', posts.value)
      
      // 如果有无效数据，记录警告
      if (rawPosts.length !== posts.value.length) {
        console.warn('发现无效帖子数据:', rawPosts.filter(post => !post || typeof post !== 'object'))
      }
    }
    
    console.log('最终帖子数据:', posts.value)
    console.log('帖子数量:', posts.value.length)
    console.log('加载状态:', loading.value)
    console.log('错误状态:', error.value)
  } catch (err) {
    console.error('加载用户帖子失败:', err)
    error.value = true
    ElMessage.error('加载失败')
  } finally {
    loading.value = false  // 结束加载
    console.log('加载完成，最终状态:', { posts: posts.value.length, loading: loading.value, error: error.value })
  }
}

/**
 * 处理点赞事件
 * @param {Object} post - 被点赞的动态对象
 */
const handleLike = (post) => {
  if (!post || !post.id) {
    console.warn('无效的帖子数据:', post)
    return
  }
  console.log('点赞帖子:', post.id)
  ElMessage.success('点赞成功')
}

/**
 * 处理评论事件
 * @param {Object} post - 被评论的动态对象
 */
const handleComment = (post) => {
  if (!post || !post.id) {
    console.warn('无效的帖子数据:', post)
    return
  }
  console.log('评论帖子:', post.id)
}

/**
 * 处理转发事件
 * @param {Object} post - 被转发的动态对象
 */
const handleRepost = (post) => {
  if (!post || !post.id) {
    console.warn('无效的帖子数据:', post)
    return
  }
  console.log('转发帖子:', post.id)
  ElMessage.success('转发成功')
}



// 组件挂载时加载用户动态
onMounted(() => {
  loadUserPosts()
})
</script>

<style scoped>
/* 用户个人主页根样式 */
.user-profile-root {
  min-height: 100vh;  /* 最小高度为视口高度 */
  background: var(--color-gray-light);  /* 背景色 */
  display: flex;
  flex-direction: column;  /* 垂直布局 */
}

/* 用户内容容器样式 */
.user-profile-container {
  display: flex;
  max-width: 1200px;  /* 最大宽度 */
  margin: 80px auto 0;  /* 上边距80px，水平居中 */
  gap: 24px;  /* 子元素间距 */
  padding: 0 20px;  /* 左右内边距 */
  flex: 1;  /* 填充剩余空间 */
}

/* 主内容区域样式 */
.user-main {
  flex: 1;  /* 填充剩余空间 */
  display: flex;
  flex-direction: column;  /* 垂直布局 */
  gap: 20px;  /* 子元素间距 */
}

/* 返回按钮样式 */
.back-button {
  margin-bottom: 8px;  /* 下边距 */
}

.back-button .el-button {
  color: var(--color-gray);  /* 文字颜色 */
  font-size: 14px;  /* 字体大小 */
}

.back-button .el-button:hover {
  color: var(--color-blue);  /* 悬停颜色 */
}

/* 用户信息卡片样式 */
.user-info-card {
  background: var(--color-white);  /* 背景色 */
  border-radius: 12px;  /* 圆角 */
  box-shadow: var(--shadow-card);  /* 阴影效果 */
  overflow: hidden;  /* 隐藏溢出内容 */
}

/* 用户横幅样式 */
.user-banner {
  height: 200px;  /* 固定高度 */
  overflow: hidden;  /* 隐藏溢出内容 */
  position: relative;  /* 相对定位 */
}

.user-banner img {
  width: 100%;  /* 宽度100% */
  height: 100%;  /* 高度100% */
  object-fit: cover;  /* 图片填充方式 */
}

/* 用户信息区域样式 */
.user-info {
  padding: 0 24px 24px;  /* 内边距 */
  position: relative;  /* 相对定位 */
}

/* 用户头像样式 */
.user-avatar {
  position: absolute;  /* 绝对定位 */
  top: -40px;  /* 向上偏移 */
  left: 24px;  /* 左边距 */
  border: 4px solid var(--color-white);  /* 白色边框 */
  border-radius: 50%;  /* 圆形 */
  box-shadow: var(--shadow-card);  /* 阴影效果 */
}

/* 用户详细信息样式 */
.user-details {
  margin-top: 60px;  /* 上边距 */
}

/* 用户名样式 */
.username {
  margin: 0 0 12px 0;  /* 外边距 */
  font-size: 24px;  /* 字体大小 */
  font-weight: 600;  /* 字体粗细 */
  color: var(--color-gray-dark);  /* 文字颜色 */
}

/* 用户统计数据样式 */
.user-stats {
  display: flex;
  gap: 24px;  /* 子元素间距 */
  margin-bottom: 16px;  /* 下边距 */
}

.stat-item {
  color: var(--color-gray);  /* 文字颜色 */
  font-size: 14px;  /* 字体大小 */
}

.stat-item strong {
  color: var(--color-gray-dark);  /* 强调文字颜色 */
  font-weight: 600;  /* 字体粗细 */
}

/* 用户个人简介样式 */
.user-bio {
  color: var(--color-gray);  /* 文字颜色 */
  font-size: 14px;  /* 字体大小 */
  line-height: 1.5;  /* 行高 */
  margin-bottom: 12px;  /* 下边距 */
}

/* 用户位置信息样式 */
.user-location {
  display: flex;
  align-items: center;  /* 垂直居中 */
  gap: 6px;  /* 子元素间距 */
  color: var(--color-gray);  /* 文字颜色 */
  font-size: 12px;  /* 字体大小 */
}

/* 内容标签页样式 */
.content-tabs {
  background: var(--color-white);  /* 背景色 */
  border-radius: 12px;  /* 圆角 */
  box-shadow: var(--shadow-card);  /* 阴影效果 */
  padding: 24px;  /* 内边距 */
}

/* 标签页头部样式 */
.user-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;  /* 下边距 */
}

/* 标签页项样式 */
.user-tabs :deep(.el-tabs__item) {
  font-size: 16px;  /* 字体大小 */
  font-weight: 500;  /* 字体粗细 */
  color: var(--color-gray);  /* 文字颜色 */
}

/* 活动标签页项样式 */
.user-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-blue);  /* 活动状态颜色 */
}

/* 活动标签页指示条样式 */
.user-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--color-blue);  /* 背景色 */
}

/* 内容头部样式 */
.content-header {
  display: flex;
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;  /* 垂直居中 */
  margin-bottom: 20px;  /* 下边距 */
  padding-bottom: 16px;  /* 下内边距 */
  border-bottom: 1px solid var(--color-gray-light);  /* 底部边框 */
}

.content-header h3 {
  margin: 0;  /* 清除默认外边距 */
  color: var(--color-gray-dark);  /* 文字颜色 */
  font-size: 18px;  /* 字体大小 */
  font-weight: 600;  /* 字体粗细 */
}

/* 内容列表样式 */
.content-list {
  min-height: 500px;  /* 最小高度 */
  height: calc(100vh - 400px);  /* 动态高度 */
  overflow: hidden;  /* 防止溢出 */
}

.loading-placeholder,
.empty-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--color-gray);
  font-size: 14px;
}

.content-list p {
  margin: 0;
  color: var(--color-gray);
}

/* 响应式设计 - 移动端适配 */
@media (max-width: 768px) {
  .user-profile-container {
    flex-direction: column;  /* 垂直布局 */
    padding: 0 16px;  /* 左右内边距 */
  }
  
  .user-stats {
    flex-wrap: wrap;  /* 允许换行 */
    gap: 16px;  /* 子元素间距 */
  }
  
  .content-header {
    flex-direction: column;  /* 垂直布局 */
    gap: 12px;  /* 子元素间距 */
    align-items: flex-start;  /* 左对齐 */
  }
}
</style>