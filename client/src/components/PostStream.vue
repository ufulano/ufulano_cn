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
      <!-- 调试信息 -->
      <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
        <p style="margin: 0; color: #2e7d32;"><strong>渲染调试:</strong></p>
        <p style="margin: 5px 0; color: #2e7d32;">筛选后帖子数量: {{ filteredPosts.length }}</p>
        <p style="margin: 5px 0; color: #2e7d32;">分页后帖子数量: {{ pagedPosts.length }}</p>
        <p style="margin: 5px 0; color: #2e7d32;">虚拟列表启用: {{ useVirtualList }}</p>
        <el-button @click="useVirtualList = !useVirtualList" size="small" style="margin-top: 5px;">
          {{ useVirtualList ? '切换到简单模式' : '切换到虚拟列表' }}
        </el-button>
      </div>
      
      <!-- 简单列表模式（调试用） -->
      <div v-if="!useVirtualList" class="simple-post-list">
        <div v-for="(post, index) in filteredPosts" :key="post.id || post._id || index" class="post-item">
          <PostCard
            :post-id="post.id || post._id"
            :avatar="parseAvatar(post.avatar || post.avatar_url)"
            :username="post.username || post.user?.username || post.author || '未知用户'"
            :time="formatTime(post.createdAt || post.created_at || post.time || post.timestamp)"
            :content="post.content || post.text || post.message"
            :images="post.images || post.image_urls || []"
            :like-count="Number(post.likes || post.like_count || post.likes_count || 0)"
            :comment-count="Number(post.comments || post.comment_count || post.comments_count || 0)"
            :repost-count="Number(post.reposts || post.repost_count || post.reposts_count || 0)"
            :read-count="Number(post.read_count || post.views || 0)"
            :is-liked="false"
            @like="handleLike(post)"
            @comment="handleComment(post)"
            @repost="handleRepost(post)"
          />
        </div>
      </div>
      
      <!-- 虚拟列表模式 -->
      <VirtualPostList 
        v-else
        :items="pagedPosts" 
        :estimated-item-height="600"
        :buffer-size="3"
        class="virtual-post-list"
        ref="virtualListRef"
      >
        <template #default="{ item: post }">
          <template v-if="post && typeof post === 'object'">
            <PostCard
              :key="post.id || post._id || Math.random()"
              :post-id="post.id || post._id"
              :avatar="parseAvatar(post.avatar || post.avatar_url)"
              :username="post.username || post.user?.username || post.author || '未知用户'"
              :time="formatTime(post.createdAt || post.created_at || post.time || post.timestamp)"
              :content="post.content || post.text || post.message"
              :images="post.images || post.image_urls || []"
              :like-count="Number(post.likes || post.like_count || post.likes_count || 0)"
              :comment-count="Number(post.comments || post.comment_count || post.comments_count || 0)"
              :repost-count="Number(post.reposts || post.repost_count || post.reposts_count || 0)"
              :read-count="Number(post.read_count || post.views || 0)"
              :is-liked="false"
              @like="handleLike(post)"
              @comment="handleComment(post)"
              @repost="handleRepost(post)"
            />
          </template>
          <template v-else>
            <div style="color: red; font-size: 12px; padding: 20px; text-align: center;">
              无效帖子数据: {{ JSON.stringify(post) }}
            </div>
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
  console.log('原始帖子数据:', props.posts);
  
  // 先过滤掉无效项，但放宽条件
  const safePosts = (props.posts || []).filter(item => {
    const isValid = item && typeof item === 'object';
    if (!isValid) {
      console.warn('发现无效帖子项:', item);
    }
    return isValid;
  });
  
  console.log('过滤后的安全帖子:', safePosts);

  let result = [];
  switch (props.filterMode) {
    case 'user':
      result = safePosts.filter(post => {
        const postUserId = post.user_id || post.userId || post.user?.id;
        const currentUserId = props.currentUserId;
        console.log('用户筛选:', { postUserId, currentUserId, match: postUserId == currentUserId });
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
  
  console.log('最终筛选结果:', result);
  return result;
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

// 调试模式：是否使用虚拟列表
const useVirtualList = ref(false) // 暂时关闭虚拟列表，使用简单模式

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

.simple-post-list {
  width: 100%;
}

.post-item {
  margin-bottom: 16px;
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