<template>
  <div class="virtual-post-list" ref="containerRef" @scroll="handleScroll">
    <!-- 虚拟容器 -->
    <div class="virtual-container" :style="containerStyle">
      <!-- 顶部占位符 -->
      <div class="virtual-spacer" :style="{ height: topSpacerHeight + 'px' }"></div>
      
      <!-- 可见的帖子项 -->
      <div 
        v-for="(post, index) in visiblePosts" 
        :key="getPostKey(post, index)"
        class="virtual-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <PostCardSkeleton 
          v-if="loadingItems.has(index)"
          :has-images="post.images && post.images.length > 0"
          :image-count="post.images ? post.images.length : 0"
        />
        <PostCard
          v-else
          :post-id="getPostId(post)"
          :avatar="parseAvatar(getPostAvatar(post))"
          :username="getPostUsername(post)"
          :time="getPostTime(post)"
          :content="getPostContent(post)"
          :images="getPostImages(post)"
          :like-count="getPostLikeCount(post)"
          :comment-count="getPostCommentCount(post)"
          :repost-count="getPostRepostCount(post)"
          :is-liked="getPostIsLiked(post)"
          @like="handleLike(post, $event)"
          @comment="handleComment(post, $event)"
          @repost="handleRepost(post, $event)"
        />
      </div>
      
      <!-- 底部占位符 -->
      <div class="virtual-spacer" :style="{ height: bottomSpacerHeight + 'px' }"></div>
    </div>
    
    <!-- 加载更多指示器 -->
    <div v-if="hasMore && !loading" class="load-more-indicator">
      <el-button @click="loadMore" type="primary" size="large">
        加载更多
      </el-button>
    </div>
    
    <!-- 加载中指示器 -->
    <div v-if="loading" class="loading-indicator">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
/**
 * VirtualPostList 组件 - 虚拟滚动帖子列表
 * 
 * 功能：
 * - 虚拟滚动：只渲染可见区域的帖子
 * - 性能优化：减少DOM节点数量
 * - 懒加载：按需加载帖子内容
 * - 无限滚动：支持大量数据展示
 * 
 * 特性：
 * - 自适应高度：根据内容动态调整
 * - 平滑滚动：优化的滚动体验
 * - 内存管理：自动清理不可见元素
 * - 响应式设计：适配不同屏幕尺寸
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import PostCard from './PostCard.vue'
import PostCardSkeleton from './PostCardSkeleton.vue'
import { parseAvatar } from '../utils/avatar'

const props = defineProps({
  /** 帖子列表 */
  posts: {
    type: Array,
    default: () => []
  },
  /** 是否正在加载 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 是否有更多数据 */
  hasMore: {
    type: Boolean,
    default: false
  },
  /** 每个帖子的预估高度 */
  itemHeight: {
    type: Number,
    default: 300
  },
  /** 可见区域外的缓冲区大小 */
  bufferSize: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['loadMore', 'like', 'comment', 'repost'])

// 响应式数据
const containerRef = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)
const loadingItems = ref(new Set())

// 计算属性
const totalHeight = computed(() => props.posts.length * props.itemHeight)

const visibleStart = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  return Math.max(0, start - props.bufferSize)
})

const visibleEnd = computed(() => {
  const end = Math.ceil((scrollTop.value + containerHeight.value) / props.itemHeight)
  return Math.min(props.posts.length, end + props.bufferSize)
})

const visiblePosts = computed(() => {
  return props.posts.slice(visibleStart.value, visibleEnd.value).map((post, index) => ({
    ...post,
    virtualIndex: visibleStart.value + index
  }))
})

const topSpacerHeight = computed(() => visibleStart.value * props.itemHeight)
const bottomSpacerHeight = computed(() => (props.posts.length - visibleEnd.value) * props.itemHeight)

const containerStyle = computed(() => ({
  height: totalHeight.value + 'px',
  position: 'relative'
}))

// 方法
const getPostKey = (post, index) => {
  return post.id || post.post_id || `post-${index}`
}

const getPostId = (post) => post.id || post.post_id
const getPostAvatar = (post) => post.avatar || post.user?.avatar_url
const getPostUsername = (post) => post.username || post.user?.username
const getPostTime = (post) => post.time || post.post_time
const getPostContent = (post) => post.content
const getPostImages = (post) => post.images || []
const getPostLikeCount = (post) => post.likes || post.like_count || 0
const getPostCommentCount = (post) => post.comments || post.comment_count || 0
const getPostRepostCount = (post) => post.reposts || post.repost_count || 0
const getPostIsLiked = (post) => post.isLiked || false

const handleLike = (post, event) => {
  emit('like', post, event)
}

const handleComment = (post, event) => {
  emit('comment', post, event)
}

const handleRepost = (post, event) => {
  emit('repost', post, event)
}

const loadMore = () => {
  emit('loadMore')
}

// 滚动处理
const handleScroll = () => {
  if (!containerRef.value) return
  
  scrollTop.value = containerRef.value.scrollTop
  containerHeight.value = containerRef.value.clientHeight
}

// 更新容器尺寸
const updateContainerSize = () => {
  if (!containerRef.value) return
  
  containerHeight.value = containerRef.value.clientHeight
}

// 监听帖子变化，管理加载状态
watch(() => props.posts, (newPosts) => {
  // 清除之前的加载状态
  loadingItems.value.clear()
  
  // 为新帖子添加加载状态
  newPosts.forEach((_, index) => {
    if (index < visibleEnd.value) {
      loadingItems.value.add(index)
      
      // 模拟加载延迟
      setTimeout(() => {
        loadingItems.value.delete(index)
      }, 300 + Math.random() * 500)
    }
  })
}, { immediate: true })

// 监听可见区域变化
watch([visibleStart, visibleEnd], ([newStart, newEnd]) => {
  // 为新的可见项添加加载状态
  for (let i = newStart; i < newEnd; i++) {
    if (!loadingItems.value.has(i)) {
      loadingItems.value.add(i)
      
      // 模拟加载延迟
      setTimeout(() => {
        loadingItems.value.delete(i)
      }, 200 + Math.random() * 300)
    }
  }
})

// 生命周期
onMounted(() => {
  nextTick(() => {
    updateContainerSize()
    handleScroll()
  })
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateContainerSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
})
</script>

<style scoped>
.virtual-post-list {
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.virtual-container {
  position: relative;
  width: 100%;
}

.virtual-spacer {
  width: 100%;
}

.virtual-item {
  width: 100%;
  position: relative;
}

.load-more-indicator,
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 8px;
}

.loading-indicator {
  color: #666;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 滚动条样式 */
.virtual-post-list::-webkit-scrollbar {
  width: 6px;
}

.virtual-post-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.virtual-post-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.virtual-post-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>