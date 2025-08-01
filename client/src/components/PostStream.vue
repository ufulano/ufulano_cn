<template>
  <div class="post-stream">
    <!-- 加载状态 -->
    <section v-if="loading" class="loading-section">
      <el-empty description="正在加载精彩内容..." :image-size="120">
        <el-button type="primary" @click="$emit('reload')">重新加载</el-button>
      </el-empty>
    </section>
    
    <!-- 错误状态 -->
    <section v-else-if="error" class="error-section">
      <el-empty description="加载失败，请重试" :image-size="120">
        <el-button type="primary" @click="$emit('reload')">重新加载</el-button>
      </el-empty>
    </section>
    <!-- 空状态 -->
    <section v-else-if="posts.length === 0" class="empty-section">
      <el-empty description="暂无内容" :image-size="120">
        <el-button type="primary" @click="$router.push('/post/new')">发布第一条动态</el-button>
      </el-empty>
    </section>
    
    <!-- 帖子列表 -->
    <section v-else class="post-list-section">
      <VirtualPostList 
        :items="filteredPosts" 
        :estimated-item-height="400"
        :buffer-size="3"
        class="virtual-post-list"
        ref="virtualListRef"
      >
        <template #default="{ item: post }">
          <PostCard
            :key="post.id"
            :post-id="post.id"
            :avatar="parseAvatar(post.avatar)"
            :username="post.username || '未知用户'"
            :time="formatTime(post.createdAt || post.time)"
            :content="post.content"
            :images="post.images || []"
            :like-count="Number(post.likes || post.like_count || 0)"
            :comment-count="Number(post.comments || post.comment_count || 0)"
            :repost-count="Number(post.reposts || post.repost_count || 0)"
            :read-count="Number(post.read_count || 0)"
            :is-liked="false"
            @like="handleLike(post)"
            @comment="handleComment(post)"
            @repost="handleRepost(post)"
          />
        </template>
      </VirtualPostList>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import PostCard from './PostCard.vue'
import VirtualPostList from './VirtualPostList.vue'
import { parseAvatar } from '../utils/avatar'
import { preloadImages, clearImageCache } from '../utils/imageLoader'
import { debounce, throttle } from '../utils/performance'

const virtualListRef = ref(null)

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
  // 筛选模式：'all' | 'user' | 'following'
  filterMode: {
    type: String,
    default: 'all'
  },
  // 当前用户ID（用于筛选用户自己的帖子）
  currentUserId: {
    type: [String, Number],
    default: null
  }
})

// 筛选帖子
const filteredPosts = computed(() => {
  console.log('PostStream - 接收到的帖子数据:', props.posts)
  console.log('PostStream - 筛选模式:', props.filterMode)
  console.log('PostStream - 当前用户ID:', props.currentUserId)
  
  if (!props.posts || props.posts.length === 0) {
    console.log('PostStream - 没有帖子数据')
    return []
  }
  
  let result = []
  switch (props.filterMode) {
    case 'user':
      // 只显示当前用户的帖子
      result = props.posts.filter(post => {
        const postUserId = post.user_id || post.userId
        const currentUserId = props.currentUserId
        console.log('筛选比较:', { postUserId, currentUserId, match: postUserId == currentUserId })
        return postUserId == currentUserId
      })
      console.log('PostStream - 用户筛选结果:', result.length, '条')
      break
    case 'following':
      // 显示关注用户的帖子（暂时返回所有帖子）
      result = props.posts
      console.log('PostStream - 关注筛选结果:', result.length, '条')
      break
    case 'all':
    default:
      // 显示所有帖子
      result = props.posts
      console.log('PostStream - 全部筛选结果:', result.length, '条')
      break
  }
  
  console.log('PostStream - 最终筛选结果:', result)
  return result
})

// 监听posts变化，优化性能
watch(() => filteredPosts.value, (newPosts) => {
  console.log('PostStream - 筛选后帖子数据:', newPosts.length, '条')
  
  // 预加载图片
  if (newPosts.length > 0) {
    const imageUrls = newPosts
      .flatMap(post => post.images || [])
      .filter(img => img && img.startsWith('data:image/'))
    
    if (imageUrls.length > 0) {
      preloadImages(imageUrls.slice(0, 10)) // 只预加载前10张图片
    }
    
    // 清理缓存
    clearImageCache(50)
  }
  
  // 更新虚拟列表高度
  nextTick(() => {
    if (virtualListRef.value) {
      virtualListRef.value.updateAllItemHeights()
    }
  })
}, { immediate: true })

const emit = defineEmits(['like', 'comment', 'repost', 'reload'])

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

// 点赞处理
const handleLike = (post) => {
  emit('like', post)
  ElMessage.success('点赞成功')
}

// 评论处理
const handleComment = (post) => {
  emit('comment', post)
}

// 转发处理
const handleRepost = (post) => {
  emit('repost', post)
  ElMessage.success('转发成功')
}


</script>

<style scoped>
.post-stream {
  width: 100%;
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
  height: calc(100vh - 200px);
  overflow: hidden;
}

.virtual-post-list {
  height: 100%;
}

/* 优化渲染性能 */
.post-card {
  will-change: transform;
  contain: layout style paint;
}

/* 图片懒加载优化 */
.post-image {
  loading: lazy;
  decoding: async;
}

@media (max-width: 1200px) {
  .loading-section,
  .error-section,
  .empty-section,
  .post-list-section {
    max-width: 98vw;
    width: 98vw;
    padding: 8px;
  }
}
</style> 