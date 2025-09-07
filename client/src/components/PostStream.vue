<template>
  <div class="post-stream">
    <!-- 加载状态 - 显示骨架屏 -->
    <section v-if="loading" class="loading-section">
      <div class="skeleton-posts">
        <PostCardSkeleton 
          v-for="n in 3" 
          :key="`skeleton-${n}`"
          :has-images="n % 2 === 0"
          :image-count="n % 2 === 0 ? (n % 3) + 1 : 0"
        />
      </div>
    </section>
    
    <!-- 错误状态 -->
    <section v-else-if="error" class="error-section">
      <el-empty description="加载失败，请重试" :image-size="120">
        <el-button type="primary" @click="$emit('reload')">重新加载</el-button>
      </el-empty>
      <!-- 错误详情 -->
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin-top: 10px; border-radius: 4px;">
        <p style="margin: 0; color: #856404;"><strong>错误详情:</strong></p>
        <p style="margin: 5px 0; color: #856404;">帖子数据: {{ posts.length }} 条</p>
        <p style="margin: 5px 0; color: #856404;">筛选模式: {{ filterMode }}</p>
        <p style="margin: 5px 0; color: #856404;">当前用户ID: {{ currentUserId }}</p>
      </div>
    </section>
    
    <!-- 空状态 -->
    <section v-else-if="posts.length === 0" class="empty-section">
      <el-empty description="暂无内容" :image-size="120">
        <el-button type="primary" @click="$router.push('/post/new')">发布第一条动态</el-button>
      </el-empty>
      <!-- 空状态详情 -->
      <div style="background: #e3f2fd; border: 1px solid #bbdefb; padding: 10px; margin-top: 10px; border-radius: 4px;">
        <p style="margin: 0; color: #1976d2;"><strong>状态详情:</strong></p>
        <p style="margin: 5px 0; color: #1976d2;">原始帖子数量: {{ posts.length }}</p>
        <p style="margin: 5px 0; color: #1976d2;">筛选模式: {{ filterMode }}</p>
        <p style="margin: 5px 0; color: #1976d2;">当前用户ID: {{ currentUserId }}</p>
        <p style="margin: 5px 0; color: #1976d2;">加载状态: {{ loading }}</p>
        <p style="margin: 5px 0; color: #1976d2;">错误状态: {{ error }}</p>
      </div>
    </section>
    
    <!-- 帖子列表 -->
    <section v-else class="post-list-section">
      <!-- 使用虚拟滚动（当帖子数量较多时） -->
      <VirtualPostList
        v-if="useVirtualScroll"
        :posts="displayPosts"
        :loading="loadingMore"
        :has-more="hasMorePosts"
        :item-height="300"
        :buffer-size="2"
        @load-more="loadMore"
        @like="handleLike"
        @comment="handleComment"
        @repost="handleRepost"
      />
      
      <!-- 普通列表（当帖子数量较少时） -->
      <div v-else class="post-list">
        <div 
          v-for="(post, index) in displayPosts" 
          :key="getPostKey(post, index)"
          class="post-item"
        >
          <!-- 转发卡片 -->
          <RepostCard
            v-if="isRepost(post)"
            :post="post"
            :current-user-id="currentUserId"
            @like="handleLike(post)"
            @comment="handleComment(post)"
            @repost="handleRepost(post)"
          />
          <!-- 普通帖子卡片 -->
          <PostCard
            v-else
            :post-id="getPostId(post)"
            :avatar="parseAvatar(getPostAvatar(post))"
            :username="getPostUsername(post)"
            :time="formatTime(getPostTime(post))"
            :content="getPostContent(post)"
            :images="getPostImages(post)"
            :like-count="getPostLikeCount(post)"
            :comment-count="getPostCommentCount(post)"
            :repost-count="getPostRepostCount(post)"
            :read-count="getPostReadCount(post)"
            :is-liked="false"
            @like="handleLike(post)"
            @comment="handleComment(post)"
            @repost="handleRepost(post)"
          />
        </div>
        
        <!-- 加载更多 -->
        <div v-if="hasMorePosts" class="load-more">
          <el-button 
            @click="loadMore" 
            :loading="loadingMore"
            type="primary"
            size="large"
          >
            加载更多
          </el-button>
        </div>
        
        <!-- 没有更多内容 -->
        <div v-else-if="posts.length > 0" class="no-more">
          <p>没有更多内容了</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import PostCard from './PostCard.vue'
import RepostCard from './RepostCard.vue'
import PostCardSkeleton from './PostCardSkeleton.vue'
import VirtualPostList from './VirtualPostList.vue'
import { parseAvatar } from '../utils/avatar'
import { preloadImages, clearImageCache, preloadCriticalImages } from '../utils/imageLoader'

const props = defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  filterMode: {
    type: String,
    default: 'all'
  },
  currentUserId: {
    type: [String, Number],
    default: null
  },
  pageSize: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['like', 'comment', 'repost', 'reload'])

// 分页状态
const currentPage = ref(1)
const loadingMore = ref(false)

// 虚拟滚动配置
const useVirtualScroll = computed(() => {
  // 当帖子数量超过20个时使用虚拟滚动
  return displayPosts.value.length > 20
})

// 当前显示的帖子
const displayPosts = computed(() => {
  const start = 0
  const end = currentPage.value * props.pageSize
  return (props.posts || []).slice(start, end)
})

// 是否还有更多帖子
const hasMorePosts = computed(() => {
  return displayPosts.value.length < (props.posts || []).length
})

// 获取帖子唯一键
const getPostKey = (post, index) => {
  return post.id || post._id || `post-${index}`
}

// 获取帖子ID
const getPostId = (post) => {
  return post.id || post._id || ''
}

// 获取帖子头像
const getPostAvatar = (post) => {
  return post.avatar || post.avatar_url || post.user?.avatar || ''
}

// 获取帖子用户名
const getPostUsername = (post) => {
  return post.username || post.user?.username || post.author || '未知用户'
}

// 获取帖子时间
const getPostTime = (post) => {
  return post.createdAt || post.created_at || post.time || post.timestamp || ''
}

// 获取帖子内容
const getPostContent = (post) => {
  return post.content || post.text || post.message || ''
}

// 判断是否为转发帖子
const isRepost = (post) => {
  // 检查多种转发标识
  const hasRepostId = post.repost_id || post.original_post_id
  const hasOriginalPost = post.originalPost || post.original_post
  const hasRepostContent = post.content && (post.repost_id || post.original_post_id)
  
  const isRepostPost = hasRepostId || hasOriginalPost || hasRepostContent
  
  console.log('转发判断:', {
    postId: post.id || post._id,
    hasRepostId,
    hasOriginalPost,
    hasRepostContent,
    isRepostPost,
    postKeys: Object.keys(post)
  })
  
  return isRepostPost
}

// 获取帖子图片
const getPostImages = (post) => {
  const images = post.images || post.image_urls || []
  console.log('PostStream - 帖子图片数据:', {
    postId: post.id,
    images: images,
    hasImages: images.length > 0
  })
  return images
}

// 获取帖子点赞数
const getPostLikeCount = (post) => {
  return Number(post.likes || post.like_count || post.likes_count || 0)
}

// 获取帖子评论数
const getPostCommentCount = (post) => {
  return Number(post.comments || post.comment_count || post.comments_count || 0)
}

// 获取帖子转发数
const getPostRepostCount = (post) => {
  return Number(post.reposts || post.repost_count || post.reposts_count || 0)
}

// 获取帖子阅读数
const getPostReadCount = (post) => {
  return Number(post.read_count || post.views || 0)
}

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

// 加载更多
const loadMore = async () => {
  loadingMore.value = true
  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    currentPage.value++
    console.log('加载更多，当前页码:', currentPage.value)
  } catch (error) {
    console.error('加载更多失败:', error)
    ElMessage.error('加载失败')
  } finally {
    loadingMore.value = false
  }
}

// 点赞处理
const handleLike = (post) => {
  emit('like', post)
  // 移除点赞成功提示，避免频繁弹窗
}

// 评论处理
const handleComment = (post) => {
  emit('comment', post)
}

// 转发处理
const handleRepost = (post) => {
  emit('repost', post)
  // 移除转发成功提示，避免频繁弹窗
}

// 监听帖子变化，预加载图片
watch(() => props.posts, (newPosts) => {
  if (newPosts.length > 0) {
    const imageUrls = newPosts
      .flatMap(post => getPostImages(post))
      .filter(img => img && (img.startsWith('data:image/') || img.startsWith('http')))
    
    console.log('发现图片URL:', imageUrls.length, '张')
    
    if (imageUrls.length > 0) {
      // 优先预加载前5张图片
      const priorityImages = imageUrls.slice(0, 5)
      console.log('预加载关键图片:', priorityImages)
      preloadCriticalImages(priorityImages)
      
      // 异步预加载其余图片
      setTimeout(() => {
        const remainingImages = imageUrls.slice(5, 15)
        if (remainingImages.length > 0) {
          console.log('预加载其余图片:', remainingImages.length, '张')
          preloadImages(remainingImages, { maxConcurrent: 3 })
        }
      }, 200)
    }
    
    // 智能清理缓存
    clearImageCache(30)
  }
}, { immediate: true })

// 监听筛选模式变化，重置分页
// watch(() => props.filterMode, () => {
//   currentPage.value = 1
// })

// 监听用户ID变化，重置分页
// watch(() => props.currentUserId, () => {
//   currentPage.value = 1
// })
</script>

<style scoped>
.post-stream {
  width: 100%;
}

.loading-section {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.skeleton-posts {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.error-section,
.empty-section {
  width: 100%;
  max-width: 900px;
  margin: 32px auto;
  text-align: center;
}

.post-list-section {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  width: 100%;
}

.load-more {
  text-align: center;
  margin-top: 24px;
  padding: 20px 0;
}

.no-more {
  text-align: center;
  margin-top: 24px;
  padding: 20px 0;
  color: var(--color-gray);
  font-size: 14px;
}

@media (max-width: 1200px) {
  .loading-section,
  .error-section,
  .empty-section,
  .post-list-section {
    width: 100%;
    padding: 8px;
  }
}
</style> 