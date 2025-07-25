<template>
  <div class="post-card">
    <div class="post-header">
      <el-avatar :src="avatar" size="large" />
      <div class="post-userinfo">
        <div class="post-username">{{ username }}</div>
        <div class="post-meta">
          <span class="post-time">{{ time }}</span>
          <span v-if="source" class="post-source">来自 {{ source }}</span>
        </div>
      </div>
      <div class="post-extra">
        <el-tag size="small" v-if="readCount !== undefined" type="info">{{ readCount }} 阅读</el-tag>
        <el-icon style="margin-left:8px;cursor:pointer;" @click="handleMore"><ChatDotRound /></el-icon>
      </div>
    </div>
    
    <div class="post-content" @click="handleContentClick">{{ content }}</div>
    
    <div v-if="images && images.length" class="post-images">
      <el-image 
        v-for="(img, index) in images" 
        :key="index" 
        :src="img" 
        fit="cover" 
        class="post-image"
        :preview-src-list="images"
        :initial-index="index"
        preview-teleported
      />
    </div>
    
    <div class="post-actions">
      <div class="action-btn" :class="{active:showRepostBar}" @click="toggleRepostBar">
        <el-icon><Share /></el-icon> 
        <span>转发</span>
        <span v-if="repostCount" class="action-count">{{ repostCount }}</span>
      </div>
      <div class="action-btn" :class="{active:showCommentBar}" @click="toggleCommentBar">
        <el-icon><ChatLineSquare /></el-icon> 
        <span>评论</span>
        <span v-if="commentCount" class="action-count">{{ commentCount }}</span>
      </div>
      <div class="action-btn" :class="{active:isLiked}" @click="handleLike">
        <el-icon><Star /></el-icon> 
        <span>赞</span>
        <span v-if="likeCount" class="action-count">{{ likeCount }}</span>
      </div>
    </div>
    
    <!-- 转发输入区 -->
    <div v-if="showRepostBar" class="repost-bar">
      <el-avatar :src="avatar" size="small" class="comment-avatar" />
      <el-input v-model="repostText" placeholder="说点什么..." class="repost-input" clearable />
      <el-popover placement="top" width="220" trigger="click">
        <template #reference>
          <el-button class="comment-icon-btn">😀</el-button>
        </template>
        <div class="emoji-panel">
          <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(repostText, emoji)">{{ emoji }}</span>
        </div>
      </el-popover>
      <el-upload :show-file-list="false" :auto-upload="false" :on-change="onRepostImageChange">
        <el-button class="comment-icon-btn"><el-icon><PictureFilled /></el-icon></el-button>
      </el-upload>
      <el-checkbox v-model="repostAlsoComment" class="comment-repost">同时评论</el-checkbox>
      <el-button type="primary" class="comment-publish" @click="onPublishRepost" :loading="repostLoading">转发</el-button>
    </div>
    
    <!-- 评论输入区 -->
    <div v-if="showCommentBar" class="comment-bar">
      <el-avatar :src="avatar" size="small" class="comment-avatar" />
      <el-input v-model="commentText" placeholder="发布你的评论" class="comment-input" clearable />
      <el-popover placement="top" width="220" trigger="click">
        <template #reference>
          <el-button class="comment-icon-btn">😀</el-button>
        </template>
        <div class="emoji-panel">
          <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertEmoji(commentText, emoji)">{{ emoji }}</span>
        </div>
      </el-popover>
      <el-upload :show-file-list="false" :auto-upload="false" :on-change="onImageChange">
        <el-button class="comment-icon-btn"><el-icon><PictureFilled /></el-icon></el-button>
      </el-upload>
      <el-checkbox v-model="repostChecked" class="comment-repost">同时转发</el-checkbox>
      <el-button type="primary" class="comment-publish" @click="onPublishComment" :loading="commentLoading">评论</el-button>
    </div>
    
    <!-- 评论列表 -->
    <div v-if="comments.length" class="comment-list">
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <el-avatar :src="c.avatar" size="small" class="comment-avatar" />
        <div class="comment-content">
          <span class="comment-username">{{ c.username }}</span>
          <span class="comment-time">{{ c.time }}</span>
          <div class="comment-text">{{ c.text }}</div>
        </div>
      </div>
    </div>
    
    <slot name="comment-bar"></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, ChatLineSquare, Star, PictureFilled, ChatDotRound } from '@element-plus/icons-vue'
import { fetchComments, addComment } from '../api/comment'

const props = defineProps({
  avatar: String,
  username: String,
  time: String,
  source: String,
  content: String,
  images: Array,
  readCount: Number,
  likeCount: Number,
  commentCount: Number,
  repostCount: Number,
  active: String, // 'repost' | 'comment' | 'like'
  postId: [String, Number],
  isLiked: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['like', 'comment', 'repost', 'content-click', 'more'])

const commentText = ref('')
const repostText = ref('')
const repostChecked = ref(false)
const showCommentBar = ref(false)
const showRepostBar = ref(false)
const repostAlsoComment = ref(false)
const commentLoading = ref(false)
const repostLoading = ref(false)

const emojiList = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😍','😘','😜','😎','😭','😡','👍','👏','🎉','❤️','🔥','🌈','🐱','🐶','🍉','🍔','⚽','🏀','🚗','✈️','🎵','💡','⭐'
]

const comments = ref([])

// 切换评论栏
const toggleCommentBar = () => {
  if (!showCommentBar.value) showRepostBar.value = false
  showCommentBar.value = !showCommentBar.value
  if (showCommentBar.value) {
    emit('comment', props.postId)
  }
}

// 切换转发栏
const toggleRepostBar = () => {
  if (!showRepostBar.value) showCommentBar.value = false
  showRepostBar.value = !showRepostBar.value
  if (showRepostBar.value) {
    emit('repost', props.postId)
  }
}

// 插入表情
const insertEmoji = (target, emoji) => {
  if (target.value == null) target.value = ''
  target.value += emoji
}

// 处理图片上传
const onImageChange = (file) => {
  // TODO: 处理评论图片上传
  ElMessage.info('图片上传功能开发中...')
}

const onRepostImageChange = (file) => {
  // TODO: 处理转发图片上传
  ElMessage.info('图片上传功能开发中...')
}

// 发布评论
const onPublishComment = async () => {
  if (!commentText.value.trim() || !props.postId) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  commentLoading.value = true
  try {
    await addComment({ postId: props.postId, content: commentText.value })
    commentText.value = ''
    repostChecked.value = false
    await loadComments()
    ElMessage.success('评论发布成功')
  } catch (error) {
    ElMessage.error('评论发布失败')
  } finally {
    commentLoading.value = false
  }
}

// 发布转发
const onPublishRepost = async () => {
  if (!repostText.value.trim()) {
    ElMessage.warning('请输入转发内容')
    return
  }
  
  repostLoading.value = true
  try {
    // TODO: 调用转发API
    emit('repost', { postId: props.postId, content: repostText.value })
    
    // 如果勾选"同时评论"，也追加到评论区
    if (repostAlsoComment.value) {
      await onPublishComment()
    }
    
    repostText.value = ''
    repostAlsoComment.value = false
    showRepostBar.value = false
    ElMessage.success('转发成功')
  } catch (error) {
    ElMessage.error('转发失败')
  } finally {
    repostLoading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  if (!props.postId) return
  try {
    comments.value = await fetchComments(props.postId)
  } catch (error) {
    console.error('加载评论失败:', error)
    comments.value = []
  }
}

// 处理点赞
const handleLike = () => {
  emit('like', props.postId)
}

// 处理内容点击
const handleContentClick = () => {
  emit('content-click', props.postId)
}

// 处理更多操作
const handleMore = () => {
  emit('more', props.postId)
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.post-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(64,191,255,0.10);
  border: none;
  margin-bottom: 32px;
  padding: 24px 32px 18px 32px;
  width: 100%;
  max-width: 600px;
  transition: box-shadow 0.3s;
  position: relative;
  margin-left: auto;
  margin-right: auto;
}

.post-card:hover {
  box-shadow: 0 6px 32px 0 rgba(64,191,255,0.15);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.post-userinfo {
  display: flex;
  flex-direction: column;
  margin-left: 14px;
  flex: 1;
}

.post-username {
  font-weight: bold;
  color: #222;
  font-size: 1.12em;
  cursor: pointer;
  transition: color 0.3s;
}

.post-username:hover {
  color: var(--color-blue);
}

.post-meta {
  color: #888;
  font-size: 0.98em;
  margin-top: 2px;
}

.post-source {
  margin-left: 8px;
  color: #b0b0b0;
}

.post-extra {
  display: flex;
  align-items: center;
}

.post-content {
  color: #333;
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 16px;
  cursor: pointer;
  transition: color 0.3s;
}

.post-content:hover {
  color: var(--color-blue-dark);
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.post-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.post-image:hover {
  transform: scale(1.02);
}

.post-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-size: 0.95em;
}

.action-btn:hover {
  background: rgba(64, 191, 255, 0.1);
  color: var(--color-blue);
}

.action-btn.active {
  color: var(--color-blue);
  background: rgba(64, 191, 255, 0.1);
}

.action-count {
  font-size: 0.85em;
  color: #999;
}

.repost-bar,
.comment-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 16px;
}

.comment-avatar {
  flex-shrink: 0;
}

.repost-input,
.comment-input {
  flex: 1;
}

.comment-icon-btn {
  padding: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.3s;
}

.comment-icon-btn:hover {
  background: rgba(64, 191, 255, 0.1);
}

.comment-repost {
  margin: 0 8px;
}

.comment-publish {
  background: var(--color-blue);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  color: white;
  font-weight: 500;
  transition: all 0.3s;
}

.comment-publish:hover {
  background: var(--color-blue-dark);
  transform: translateY(-1px);
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
  transition: background 0.3s;
}

.emoji-item:hover {
  background: #f0f0f0;
}

.comment-list {
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.comment-item:hover {
  background: #f8f9fa;
}

.comment-content {
  flex: 1;
}

.comment-username {
  font-weight: bold;
  color: #222;
  margin-right: 8px;
}

.comment-time {
  color: #999;
  font-size: 0.85em;
}

.comment-text {
  margin-top: 4px;
  color: #333;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .post-card {
    padding: 16px 20px 12px 20px;
    margin-bottom: 20px;
  }
  
  .post-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px;
    font-size: 0.9em;
  }
  
  .repost-bar,
  .comment-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .post-images {
    grid-template-columns: 1fr;
  }
}
</style> 