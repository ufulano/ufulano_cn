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
        :items="pagedPosts" 
        :estimated-item-height="600"
        :buffer-size="3"
        class="virtual-post-list"
        ref="virtualListRef"
      >
        <template #default="{ item: post }">
          <template v-if="post && typeof post === 'object' && 'id' in post">
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
          <template v-else>
            <div style="color: red; font-size: 12px;">无效帖子数据，已跳过</div>
          </template>
        </template>
      </VirtualPostList>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
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
  // 先过滤掉无效项
  const safePosts = (props.posts || []).filter(item => item && typeof item === 'object' && 'id' in item);

  let result = [];
  switch (props.filterMode) {
    case 'user':
      result = safePosts.filter(post => {
        const postUserId = post.user_id || post.userId;
        const currentUserId = props.currentUserId;
        return postUserId == currentUserId;
      });
      break;
    case 'following':
      result = safePosts;
      break;
    case 'all':
    default:
      result = safePosts;
      break;
  }
  // 再过滤一次，确保万无一失
  return result.filter(item => item && typeof item === 'object' && 'id' in item);
});

// 监控 posts 数据源，发现无效项时 log 警告
watch(() => props.posts, (val) => {
  if (val && val.some(item => !item || typeof item !== 'object' || !('id' in item))) {
    console.warn('发现无效项:', val.filter(item => !item || typeof item !== 'object' || !('id' in item)));
  }
});

// 监听posts变化，优化性能
watch(() => filteredPosts.value, (newPosts) => {
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

const page = ref(1)
const pageSize = 20
const pagedPosts = computed(() => filteredPosts.value.slice(0, page.value * pageSize))

// 无限滚动监听
const handleScroll = (e) => {
  const el = e.target
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    if (pagedPosts.value.length < filteredPosts.value.length) {
      page.value++
    }
  }
}

onMounted(() => {
  const container = document.querySelector('.virtual-post-list')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

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
  height: 100%;  /* 使用父容器的高度 */
  min-height: 500px;  /* 最小高度 */
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