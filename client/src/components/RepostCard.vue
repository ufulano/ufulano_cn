<template>
  <!-- 链式转发卡片组件 -->
  <div class="repost-chain-card">
    <!-- 转发链条连接线 -->
    <div class="chain-line"></div>
    
    <!-- 当前转发层 -->
    <div class="repost-layer">
      <!-- 转发信息头部 -->
      <div class="repost-header">
        <div class="repost-info">
          <el-icon class="repost-icon">
            <Share />
          </el-icon>
          <span class="repost-text">
            <strong>{{ reposterName }}</strong> 转发了
          </span>
        </div>
        <div class="repost-time">
          {{ formatTime(post.post_time) }}
        </div>
      </div>

      <!-- 转发内容（如果有） -->
      <div v-if="post.content" class="repost-content">
        <p class="repost-text-content">{{ post.content }}</p>
      </div>

      <!-- 原帖内容或嵌套转发 -->
      <div class="original-post" :class="{ 'has-repost-content': post.content }">
        <!-- 如果原帖也是转发，递归显示转发链条 -->
        <RepostCard 
          v-if="originalPost.is_repost && originalPost.originalPost"
          :post="originalPost"
          :current-user-id="currentUserId"
          @like="handleNestedLike"
          @comment="handleNestedComment"
          @repost="handleNestedRepost"
          @view-user="handleNestedViewUser"
          class="nested-repost"
        />
        
        <!-- 普通原帖内容 -->
        <template v-else>
          <div class="original-post-header">
            <div class="user-info">
              <el-avatar 
                :src="originalPost.user?.avatar_url" 
                :size="32"
                class="user-avatar"
              >
                {{ originalPost.user?.nickname?.charAt(0) || originalPost.user?.username?.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <span class="username">{{ originalPost.user?.nickname || originalPost.user?.username }}</span>
                <span class="user-handle">@{{ originalPost.user?.username }}</span>
              </div>
            </div>
            <div class="original-time">
              {{ formatTime(originalPost.post_time) }}
            </div>
          </div>

          <div class="original-content">
            <p v-if="originalPost.content" class="original-text">{{ originalPost.content }}</p>
            
            <!-- 原帖图片 -->
            <div v-if="originalPost.image_url" class="original-images">
              <div class="image-grid" :class="getImageGridClass(originalPost.image_url)">
                <div 
                  v-for="(image, index) in parseImages(originalPost.image_url)" 
                  :key="index"
                  class="image-item"
                  @click="previewImage(image, index)"
                >
                  <img 
                    :src="image" 
                    :alt="`图片 ${index + 1}`"
                    class="post-image"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 原帖互动统计 -->
          <div class="original-stats">
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ originalPost.comment_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Share /></el-icon>
              <span>{{ originalPost.repost_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ originalPost.like_count || 0 }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- 当前层转发操作栏 -->
      <div class="repost-actions">
        <div class="action-item" @click="handleComment">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ post.comment_count || 0 }}</span>
        </div>
        <div class="action-item" @click="handleRepost">
          <el-icon><Share /></el-icon>
          <span>{{ post.repost_count || 0 }}</span>
        </div>
        <div class="action-item" @click="handleLike">
          <el-icon :class="{ 'liked': isLiked }"><Star /></el-icon>
          <span>{{ post.like_count || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, ChatDotRound, Star } from '@element-plus/icons-vue'
import { toggleLike, getLikeStatus } from '../api/like'

// Props
const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  currentUserId: {
    type: [Number, String],
    default: null
  }
})

// Emits
const emit = defineEmits(['like', 'comment', 'repost', 'view-user'])

// 响应式数据
const isLiked = ref(false)

// 计算属性
const reposterName = computed(() => {
  return props.post.user?.nickname || props.post.user?.username || '未知用户'
})

const originalPost = computed(() => {
  return props.post.originalPost || {}
})

// 方法
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}小时前`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const parseImages = (imageUrl) => {
  if (!imageUrl) return []
  try {
    if (typeof imageUrl === 'string') {
      return JSON.parse(imageUrl)
    }
    return Array.isArray(imageUrl) ? imageUrl : [imageUrl]
  } catch {
    return [imageUrl]
  }
}

const getImageGridClass = (imageUrl) => {
  const images = parseImages(imageUrl)
  const count = images.length
  
  if (count === 1) return 'single'
  if (count === 2) return 'double'
  if (count === 3) return 'triple'
  if (count === 4) return 'quad'
  return 'multiple'
}

const previewImage = (image, index) => {
  // TODO: 实现图片预览功能
  console.log('预览图片:', image, index)
}

const handleLike = async () => {
  if (!props.post.post_id) {
    ElMessage.warning('帖子ID不存在')
    return
  }
  
  try {
    const response = await toggleLike(props.post.post_id)
    
    if (response.success) {
      // 更新本地状态
      isLiked.value = response.liked
      
      // 触发父组件事件
      emit('like', {
        post: props.post,
        liked: response.liked,
        likeCount: response.likeCount
      })
      
      ElMessage.success(response.message)
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error(error.response?.data?.message || '点赞失败，请重试')
  }
}

const handleComment = () => {
  emit('comment', props.post)
}

const handleRepost = () => {
  emit('repost', props.post)
}

// 嵌套转发事件处理
const handleNestedLike = (event) => {
  emit('like', event)
}

const handleNestedComment = (event) => {
  emit('comment', event)
}

const handleNestedRepost = (event) => {
  emit('repost', event)
}

const handleNestedViewUser = (event) => {
  emit('view-user', event)
}

// 初始化点赞状态
const initLikeStatus = async () => {
  if (!props.post.post_id) return
  
  try {
    const response = await getLikeStatus(props.post.post_id)
    if (response.success) {
      isLiked.value = response.liked
    }
  } catch (error) {
    console.error('获取点赞状态失败:', error)
  }
}

// 组件挂载时初始化点赞状态
onMounted(() => {
  initLikeStatus()
})
</script>

<style scoped>
.repost-chain-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  margin-bottom: 12px;
  border: 1px solid #e1e8ed;
  transition: all 0.2s ease;
  overflow: hidden;
}

.repost-chain-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 转发链条连接线 */
.chain-line {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    #1da1f2 0%,
    #1da1f2 20%,
    #e1e8ed 20%,
    #e1e8ed 80%,
    #1da1f2 80%,
    #1da1f2 100%
  );
  z-index: 1;
}

/* 当前转发层 */
.repost-layer {
  position: relative;
  padding: 16px 16px 16px 40px;
  background: #fff;
  border-radius: 16px;
  z-index: 2;
}

/* 嵌套转发样式 */
.nested-repost {
  margin-top: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  background: #fafbfc;
}

.nested-repost .chain-line {
  left: 20px;
  background: linear-gradient(
    to bottom,
    #657786 0%,
    #657786 20%,
    #e1e8ed 20%,
    #e1e8ed 80%,
    #657786 80%,
    #657786 100%
  );
}

.nested-repost .repost-layer {
  padding-left: 40px;
}

.repost-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.repost-header::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: #1da1f2;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #1da1f2;
  z-index: 3;
}

.repost-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #657786;
  font-size: 14px;
}

.repost-icon {
  color: #1da1f2;
  font-size: 16px;
}

.repost-text {
  font-weight: 500;
}

.repost-time {
  color: #657786;
  font-size: 12px;
}

.repost-content {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 3px solid #1da1f2;
}

.repost-text-content {
  margin: 0;
  color: #14171a;
  line-height: 1.5;
  word-break: break-word;
}

.original-post {
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 16px;
  background: #fafbfc;
  transition: all 0.2s ease;
  position: relative;
  margin-left: 8px;
}

.original-post::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e1e8ed;
}

.original-post:hover {
  background: #f5f7fa;
  border-color: #d1d9e0;
}

.original-post.has-repost-content {
  margin-top: 8px;
}

/* 嵌套转发的原帖样式 */
.nested-repost .original-post {
  background: #f8f9fa;
  border-color: #e1e8ed;
  margin-left: 0;
}

.nested-repost .original-post::before {
  display: none;
}

.original-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  color: #14171a;
  font-size: 14px;
}

.user-handle {
  color: #657786;
  font-size: 12px;
}

.original-time {
  color: #657786;
  font-size: 12px;
}

.original-content {
  margin-bottom: 12px;
}

.original-text {
  margin: 0 0 12px 0;
  color: #14171a;
  line-height: 1.5;
  word-break: break-word;
}

.original-images {
  margin-top: 12px;
}

.image-grid {
  display: grid;
  gap: 4px;
  border-radius: 12px;
  overflow: hidden;
}

.image-grid.single {
  grid-template-columns: 1fr;
  max-width: 400px;
}

.image-grid.double {
  grid-template-columns: 1fr 1fr;
  max-width: 400px;
}

.image-grid.triple {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 400px;
}

.image-grid.triple .image-item:first-child {
  grid-row: 1 / 3;
}

.image-grid.quad {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 400px;
}

.image-grid.multiple {
  grid-template-columns: repeat(3, 1fr);
  max-width: 500px;
}

.image-item {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.image-item:hover img {
  transform: scale(1.05);
}

.original-stats {
  display: flex;
  gap: 24px;
  padding-top: 12px;
  border-top: 1px solid #e1e8ed;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #657786;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.stat-item:hover {
  color: #1da1f2;
}

.repost-actions {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #e1e8ed;
  margin-top: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #657786;
  font-size: 14px;
}

.action-item:hover {
  background: #f0f8ff;
  color: #1da1f2;
}

.action-item.liked {
  color: #e0245e;
}

.action-item.liked:hover {
  background: #fef0f3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .repost-chain-card {
    border-radius: 12px;
  }
  
  .repost-layer {
    padding: 12px 12px 12px 32px;
  }
  
  .chain-line {
    left: 16px;
    width: 1px;
  }
  
  .repost-header::before {
    left: -16px;
    width: 6px;
    height: 6px;
  }
  
  .original-post {
    padding: 12px;
    margin-left: 4px;
  }
  
  .original-post::before {
    left: -4px;
  }
  
  .nested-repost .repost-layer {
    padding-left: 32px;
  }
  
  .nested-repost .chain-line {
    left: 16px;
  }
  
  .image-grid.single,
  .image-grid.double,
  .image-grid.triple,
  .image-grid.quad {
    max-width: 100%;
  }
  
  .repost-actions {
    gap: 8px;
  }
  
  .action-item {
    padding: 6px 8px;
    font-size: 13px;
  }
}
</style>
