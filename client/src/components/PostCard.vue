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
        <el-tag size="small" v-if="readCount !== undefined">{{ readCount }} 阅读</el-tag>
        <el-icon style="margin-left:8px;cursor:pointer;"><ChatDotRound /></el-icon>
      </div>
    </div>
    <div class="post-content">{{ content }}</div>
    <div v-if="images && images.length" class="post-images">
      <el-image v-for="img in images" :key="img" :src="img" fit="cover" class="post-image" />
    </div>
    <div class="post-actions">
      <div class="action-btn" :class="{active:showRepostBar}" @click="toggleRepostBar">
        <el-icon><Share /></el-icon> 转发
      </div>
      <div class="action-btn" :class="{active:showCommentBar}" @click="toggleCommentBar">
        <el-icon><ChatLineSquare /></el-icon> 评论
      </div>
      <div class="action-btn" :class="{active:active==='like'}" @click="$emit('like')">
        <el-icon><Star /></el-icon> 赞
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
      <el-button type="primary" class="comment-publish" @click="onPublishRepost">转发</el-button>
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
import { ref, onMounted } from 'vue'
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
  active: String, // 'repost' | 'comment' | 'like'
  postId: [String, Number]
})
const commentText = ref('')
const repostText = ref('')
const repostChecked = ref(false)
const showCommentBar = ref(false)
const showRepostBar = ref(false)
const repostAlsoComment = ref(false)
const emojiList = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😍','😘','😜','😎','😭','😡','👍','👏','🎉','❤️','🔥','🌈','🐱','🐶','🍉','🍔','⚽','🏀','🚗','✈️','🎵','💡','⭐'
]
const comments = ref([])
const commentLoading = ref(false)
const toggleCommentBar = () => {
  if (!showCommentBar.value) showRepostBar.value = false
  showCommentBar.value = !showCommentBar.value
}
const toggleRepostBar = () => {
  if (!showRepostBar.value) showCommentBar.value = false
  showRepostBar.value = !showRepostBar.value
}
const insertEmoji = (target, emoji) => {
  if (target.value == null) target.value = ''
  target.value += emoji
}
const onImageChange = (file) => {
  // TODO: 处理评论图片上传
}
const onRepostImageChange = (file) => {
  // TODO: 处理转发图片上传
}
const onPublishComment = async () => {
  if (!commentText.value.trim() || !props.postId) return
  commentLoading.value = true
  try {
    await addComment({ postId: props.postId, content: commentText.value })
    commentText.value = ''
    repostChecked.value = false
    await loadComments()
  } finally {
    commentLoading.value = false
  }
}
const onPublishRepost = () => {
  // TODO: 处理转发逻辑
  if (!repostText.value.trim()) return
  // 如果勾选“同时评论”，也追加到评论区
  if (repostAlsoComment.value) {
    onPublishComment()
  }
  repostText.value = ''
  repostAlsoComment.value = false
  showRepostBar.value = false
}
const loadComments = async () => {
  if (!props.postId) return
  try {
    comments.value = await fetchComments(props.postId)
  } catch {
    comments.value = []
  }
}
onMounted(loadComments)
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
.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
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
  margin-left: auto;
}
.post-content {
  margin: 14px 0 10px 0;
  white-space: pre-line;
  font-size: 1.08em;
  color: #222;
}
.post-images {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.post-image {
  max-width: 180px;
  max-height: 140px;
  border-radius: 8px;
  border: 1px solid #eee;
  object-fit: cover;
}
.post-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 32px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  font-size: 1.05em;
}
.action-btn {
  display: flex;
  align-items: center;
  color: #888;
  cursor: pointer;
  gap: 4px;
  transition: color 0.2s;
}
.action-btn.active,
.action-btn:hover {
  color: #40BFFF;
}
.comment-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 0 0 0;
  border-top: 1px solid #f0f0f0;
}
.comment-avatar {
  margin-right: 4px;
}
.comment-input {
  flex: 1;
  min-width: 0;
}
.comment-icon-btn {
  background: #f7f7f7;
  border: none;
  color: #888;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 1.1em;
  transition: background 0.2s, color 0.2s;
}
.comment-icon-btn:hover {
  background: #e6f7ff;
  color: #40BFFF;
}
.comment-repost {
  margin-left: 8px;
  color: #888;
}
.comment-publish {
  margin-left: 8px;
  border-radius: 8px;
  font-weight: bold;
  padding: 0 18px;
}
.emoji-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 200px;
  padding: 4px 0;
}
.emoji-item {
  font-size: 1.3em;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 4px;
  padding: 2px 4px;
}
.emoji-item:hover {
  background: #e6f7ff;
}
.comment-list {
  margin-top: 12px;
  max-height: 180px;
  overflow-y: auto;
  border-radius: 8px;
  background: #f7f7f7;
  padding: 8px 8px 4px 8px;
}
.comment-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.comment-content {
  margin-left: 8px;
  background: #fff;
  border-radius: 8px;
  padding: 6px 12px 6px 10px;
  box-shadow: 0 1px 4px 0 rgba(64,191,255,0.06);
  flex: 1;
}
.comment-username {
  font-weight: bold;
  color: #40BFFF;
  margin-right: 8px;
}
.comment-time {
  color: #aaa;
  font-size: 0.92em;
}
.comment-text {
  margin-top: 2px;
  color: #222;
  font-size: 1.02em;
}
.repost-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 10px 0 0 0;
  border-top: 1px solid #f0f0f0;
}
.repost-input {
  flex: 1;
  min-width: 0;
}
</style> 