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
      <PostCard
        v-for="post in posts"
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
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import PostCard from './PostCard.vue'

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