<template>
  <!-- 帖子卡片组件 - 显示单个帖子的完整信息 -->
  <div class="post-card">
    <!-- 帖子头部 - 用户信息和元数据 -->
    <div class="post-header">
      <!-- 用户头像区域 -->
      <div class="post-avatar-wrapper">
        <img 
          v-if="parseAvatar(avatar) && parseAvatar(avatar).startsWith('data:image/')" 
          :src="parseAvatar(avatar)" 
          :alt="username"
          class="post-avatar-img"
          style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;"
        />
        <el-avatar 
          v-else
          :src="parseAvatar(avatar)" 
          size="large" 
          class="post-avatar"
        />
      </div>
      <!-- 用户信息区域 -->
      <div class="post-userinfo">
        <div class="post-username">{{ username }}</div>
        <!-- 帖子元数据 - 时间和来源 -->
        <div class="post-meta">
          <span class="post-time">{{ time }}</span>
          <span v-if="source" class="post-source">来自 {{ source }}</span>
        </div>
      </div>
      <!-- 额外信息区域 - 阅读数和更多操作 -->
      <div class="post-extra">
        <el-tag size="small" v-if="readCount !== undefined" type="info">{{ readCount }} 阅读</el-tag>
        <el-icon style="margin-left:8px;cursor:pointer;" @click="handleMore"><ChatDotRound /></el-icon>
      </div>
    </div>
    
    <!-- 帖子内容区域 -->
    <div class="post-content" @click="handleContentClick">{{ content }}</div>
    
    <!-- 图片显示区域 - 支持多图布局 -->
    <div v-if="images && images.length" class="post-images" :data-count="images.length">
      <div 
        v-for="(img, index) in images" 
        :key="index" 
        class="post-image-wrapper"
        @click="handleImageClick(index)"
      >
        <el-image 
          :src="img" 
          fit="cover" 
          class="post-image"
          :preview-src-list="images"
          :initial-index="index"
          preview-teleported
          :style="{ maxWidth: '100%', maxHeight: '100px', objectFit: 'cover' }"
          lazy
        />
        <div class="image-overlay">
          <el-icon><PictureFilled /></el-icon>
          <span>点击查看大图</span>
        </div>
      </div>
    </div>
    
    <!-- 帖子操作区域 - 转发、评论、点赞 -->
    <div class="post-actions" style="display: flex !important; visibility: visible !important;">
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
    
    <!-- 转发输入区域 -->
    <div v-if="showRepostBar" class="repost-bar">
      <el-avatar :src="avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='" size="small" class="comment-avatar" style="width: 32px; height: 32px;" />
      <el-input v-model="repostText" placeholder="说点什么..." class="repost-input" clearable />
      <el-popover placement="top" width="220" trigger="click">
        <template #reference>
          <el-button class="comment-icon-btn">😀</el-button>
        </template>
        <div class="emoji-panel">
          <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertRepostEmoji(emoji)">{{ emoji }}</span>
        </div>
      </el-popover>
      <!-- 暂时隐藏图片上传按钮 -->
      <!-- <el-upload :show-file-list="false" :auto-upload="false" :on-change="onRepostImageChange">
        <el-button class="comment-icon-btn"><el-icon><PictureFilled /></el-icon></el-button>
      </el-upload> -->
      <el-checkbox v-model="repostAlsoComment" class="comment-repost">同时评论</el-checkbox>
      <el-button type="primary" class="comment-publish" @click="onPublishRepost" :loading="repostLoading">转发</el-button>
    </div>
    
    <!-- 评论输入区域 -->
    <div v-if="showCommentBar" class="comment-bar">
      <el-avatar :src="avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='" size="small" class="comment-avatar" style="width: 32px; height: 32px;" />
      <el-input v-model="commentText" placeholder="发布你的评论" class="comment-input" clearable />
      <el-popover placement="top" width="220" trigger="click">
        <template #reference>
          <el-button class="comment-icon-btn">😀</el-button>
        </template>
        <div class="emoji-panel">
          <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="insertCommentEmoji(emoji)">{{ emoji }}</span>
        </div>
      </el-popover>
      <!-- 暂时隐藏图片上传按钮 -->
      <!-- <el-upload :show-file-list="false" :auto-upload="false" :on-change="onImageChange">
        <el-button class="comment-icon-btn"><el-icon><PictureFilled /></el-icon></el-button>
      </el-upload> -->
      <el-checkbox v-model="repostChecked" class="comment-repost">同时转发</el-checkbox>
      <el-button type="primary" class="comment-publish" @click="onPublishComment" :loading="commentLoading">评论</el-button>
    </div>
    
    <!-- 评论列表区域 -->
    <div v-if="comments.length" class="comment-list">
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <el-avatar :src="parseAvatar(c.user?.avatar || c.avatar)" size="small" class="comment-avatar" style="width: 32px; height: 32px;" />
        <div class="comment-content">
          <span class="comment-username">{{ c.user?.username || c.username }}</span>
          <span class="comment-time">{{ c.time }}</span>
          <div class="comment-text">{{ c.content || c.text }}</div>
        </div>
      </div>
    </div>
    
    <slot name="comment-bar"></slot>
  </div>
</template>

<script setup>
/**
 * PostCard 组件 - 帖子卡片
 * 功能：显示单个帖子的完整信息，包括用户信息、内容、图片、操作按钮等
 * 支持：点赞、评论、转发、图片预览等功能
 */

import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Share, ChatLineSquare, Star, PictureFilled, ChatDotRound } from '@element-plus/icons-vue'
import AvatarUpload from './AvatarUpload.vue'
import { fetchComments, addComment } from '../api/comment'
import { createRepost } from '../api/repost'
import { toggleLike, getLikeStatus } from '../api/like'
import { parseAvatar } from '../utils/avatar'
// import { lazyLoadImage, preloadImages } from '../utils/imageLoader'

// 组件属性定义
const props = defineProps({
  avatar: String,        // 用户头像
  username: String,      // 用户名
  time: String,          // 发布时间
  source: String,        // 来源信息
  content: String,       // 帖子内容
  images: Array,         // 图片数组
  readCount: Number,     // 阅读数
  likeCount: Number,     // 点赞数
  commentCount: Number,  // 评论数
  repostCount: Number,   // 转发数
  active: String,        // 当前激活的操作类型: 'repost' | 'comment' | 'like'
  postId: [String, Number], // 帖子ID
  isLiked: {            // 当前用户是否已点赞
    type: Boolean,
    default: false
  }
})

// 组件事件定义
const emit = defineEmits(['like', 'comment', 'repost', 'content-click', 'more'])

// 响应式数据定义
const commentText = ref('')        // 评论输入内容
const repostText = ref('')         // 转发输入内容
const repostChecked = ref(false)   // 是否同时转发
const showCommentBar = ref(false)  // 是否显示评论栏
const showRepostBar = ref(false)   // 是否显示转发栏
const repostAlsoComment = ref(false) // 转发时是否同时评论
const commentLoading = ref(false)  // 评论发布中状态
const repostLoading = ref(false)   // 转发发布中状态

// 表情符号列表
const emojiList = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😍','😘','😜','😎','😭','😡','👍','👏','🎉','❤️','🔥','🌈','🐱','🐶','🍉','🍔','⚽','🏀','🚗','✈️','🎵','💡','⭐'
]

// 评论列表
const comments = ref([])
// const fullImages = ref([]) // 存储原图 - 暂时禁用
// const loadedFullImages = ref(new Set()) // 记录已加载的原图 - 暂时禁用

// 图片压缩函数 - 暂时禁用
// const compressImage = (src, maxWidth = 300, maxHeight = 200) => {
//   return new Promise((resolve) => {
//     const img = new Image()
//     img.onload = () => {
//       const canvas = document.createElement('canvas')
//       const ctx = canvas.getContext('2d')
//       
//       let { width, height } = img
//       
//       // 计算压缩比例
//       if (width > maxWidth) {
//         height = (height * maxWidth) / width
//         width = maxWidth
//       }
//       if (height > maxHeight) {
//         width = (width * maxHeight) / height
//         height = maxHeight
//       }
//       
//       canvas.width = width
//       canvas.height = height
//       
//       ctx.drawImage(img, 0, 0, width, height)
//       
//       // 压缩为JPEG格式，质量0.6
//       const compressedSrc = canvas.toDataURL('image/jpeg', 0.6)
//       resolve(compressedSrc)
//     }
//     img.onerror = () => resolve(src) // 如果加载失败，返回原图
//     img.src = src
//   })
// }

// 压缩后的图片列表 - 暂时禁用
// const compressedImages = ref([])

// 监听images变化，自动压缩 - 暂时禁用
// watch(() => props.images, async (newImages) => {
//   if (newImages && newImages.length > 0) {
//     compressedImages.value = []
//     for (const img of newImages) {
//       const compressed = await compressImage(img)
//       compressedImages.value.push(compressed)
//     }
//   }
// }, { immediate: true })

// 图片懒加载状态 - 暂时禁用
// const imageLoadingStates = ref(new Map())
// const imageIntersectionObserver = ref(null)

// 图片懒加载 - 暂时禁用
// const setupImageLazyLoading = () => {
//   if (!props.images || props.images.length === 0) return
//   
//   // 预加载第一张图片
//   if (props.images[0]) {
//     lazyLoadImage(props.images[0], () => {
//       console.log('第一张图片预加载完成')
//     })
//   }
//   
//   // 设置Intersection Observer
//   if ('IntersectionObserver' in window) {
//     imageIntersectionObserver.value = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           const imgIndex = parseInt(entry.target.dataset.index)
//           const imgSrc = props.images[imgIndex]
//           
//           if (imgSrc && !imageLoadingStates.value.get(imgIndex)) {
//             imageLoadingStates.value.set(imgIndex, 'loading')
//             lazyLoadImage(imgSrc, () => {
//               imageLoadingStates.value.set(imgIndex, 'loaded')
//             })
//           }
//         }
//       })
//     }, {
//       rootMargin: '50px' // 提前50px开始加载
//     })
//   }
// }

// 切换评论栏
const toggleCommentBar = () => {
  if (!showCommentBar.value) showRepostBar.value = false
  showCommentBar.value = !showCommentBar.value
  if (showCommentBar.value && comments.value.length === 0) {
    loadComments()
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

// 插入表情到评论
const insertCommentEmoji = (emoji) => {
  commentText.value += emoji
}

// 插入表情到转发
const insertRepostEmoji = (emoji) => {
  repostText.value += emoji
}


// 判断是否为缩略图 - 暂时禁用
// const isThumbnail = (imgSrc) => {
//   // 通过图片大小或URL特征判断是否为缩略图
//   if (!imgSrc) return false
//   const sizeKB = (imgSrc.length * 3) / 4 / 1024
//   return sizeKB < 50 // 小于50KB认为是缩略图
// }

// 加载完整图片用于预览 - 暂时禁用
// const loadFullImage = async (index) => {
//   if (!props.images || !props.images[index]) return
//   
//   const originalImage = props.images[index]
//   
//   // 如果原图还没加载过，先加载
//   if (!loadedFullImages.value.has(originalImage)) {
//     try {
//       // 预加载原图
//       await new Promise((resolve, reject) => {
//         const img = new Image()
//         img.onload = resolve
//         img.onerror = reject
//         img.src = originalImage
//       })
//       loadedFullImages.value.add(originalImage)
//     } catch (error) {
//       console.warn('原图加载失败:', originalImage)
//     }
//   }
//   
//   // 更新预览列表
//   fullImages.value = props.images
// }

// 图片懒加载 - 暂时禁用
// const setupImageLazyLoading = () => {
//   if (!props.images || props.images.length === 0) return
//   
//   // 预加载第一张图片
//   if (props.images[0]) {
//     lazyLoadImage(props.images[0], () => {
//       console.log('第一张图片预加载完成')
//     })
//   }
//   
//   // 设置Intersection Observer
//   if ('IntersectionObserver' in window) {
//     imageIntersectionObserver.value = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           const imgIndex = parseInt(entry.target.dataset.index)
//           const imgSrc = props.images[imgIndex]
//           
//           if (imgSrc && !imageLoadingStates.value.get(imgIndex)) {
//             imageLoadingStates.value.set(imgIndex, 'loading')
//             lazyLoadImage(imgSrc, () => {
//               imageLoadingStates.value.set(imgIndex, 'loaded')
//             })
//           }
//         }
//       })
//     }, {
//       rootMargin: '50px' // 提前50px开始加载
//     })
//   }
// }

// 处理图片上传 - 暂时禁用
// const onImageChange = (file) => {
//   // TODO: 处理评论图片上传
//   ElMessage.info('图片上传功能开发中...')
// }

// const onRepostImageChange = (file) => {
//   // TODO: 处理转发图片上传
//   ElMessage.info('图片上传功能开发中...')
// }

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
  if (!props.postId) {
    ElMessage.warning('帖子ID不存在')
    return
  }
  
  repostLoading.value = true
  try {
    // 调用转发API
    const response = await createRepost({
      originalPostId: props.postId,
      repostContent: repostText.value.trim() || null
    })
    
    if (response.success) {
      // 如果勾选"同时评论"，也追加到评论区
      if (repostAlsoComment.value && repostText.value.trim()) {
        await addComment({ postId: props.postId, content: repostText.value })
      }
      
      repostText.value = ''
      repostAlsoComment.value = false
      showRepostBar.value = false
      ElMessage.success('转发成功')
      
      // 触发父组件的转发事件，用于刷新帖子列表
      emit('repost', { postId: props.postId, repostData: response.data })
    } else {
      ElMessage.error(response.message || '转发失败')
    }
  } catch (error) {
    console.error('转发失败:', error)
    ElMessage.error(error.response?.data?.message || '转发失败，请重试')
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

// 初始化点赞状态
const initLikeStatus = async () => {
  if (!props.postId) return
  
  try {
    const response = await getLikeStatus(props.postId)
    if (response.success) {
      isLiked.value = response.liked
    }
  } catch (error) {
    console.error('获取点赞状态失败:', error)
  }
}

// 组件挂载时设置图片懒加载和点赞状态
onMounted(() => {
  // setupImageLazyLoading()
  initLikeStatus()
})

// 组件卸载时清理Observer
onUnmounted(() => {
  // if (imageIntersectionObserver.value) {
  //   imageIntersectionObserver.value.disconnect()
  // }
})

// 处理点赞
const handleLike = async () => {
  if (!props.postId) {
    ElMessage.warning('帖子ID不存在')
    return
  }
  
  try {
    const response = await toggleLike(props.postId)
    
    if (response.success) {
      // 更新本地状态
      isLiked.value = response.liked
      
      // 触发父组件事件，传递更新后的点赞数
      emit('like', {
        postId: props.postId,
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

// 处理内容点击
const handleContentClick = () => {
  emit('content-click', props.postId)
}

// 处理更多操作
const handleMore = () => {
  emit('more', props.postId)
}

// 处理图片点击
const handleImageClick = (index) => {
  // 图片预览功能由 el-image 组件自动处理
  console.log('点击图片:', index)
}

</script>

<style scoped>
.post-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 2px solid transparent;
  margin-bottom: 32px;
  padding: 28px 36px 24px 36px;
  width: 100%;
  max-width: 900px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background-clip: padding-box;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-blue) 0%, var(--color-yellow) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(45deg, 
    var(--color-blue) 0%, 
    transparent 30%, 
    var(--color-yellow) 50%, 
    transparent 70%, 
    var(--color-blue) 100%);
  background-size: 400% 400%;
  animation: borderFlow 3s ease-in-out infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-card:hover {
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 12px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-4px);
}

.post-card:hover::before {
  opacity: 1;
}

.post-card:hover::after {
  opacity: 1;
}

@keyframes borderFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.post-header .el-avatar {
  border: 2px solid var(--color-gray-light);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 48px !important;
  height: 48px !important;
}

.post-avatar-img {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  border: 2px solid var(--color-gray-light);
  transition: all 0.3s ease;
  cursor: pointer;
}

.comment-avatar {
  width: 32px !important;
  height: 32px !important;
}

.post-header .el-avatar:hover {
  border-color: var(--color-blue);
  transform: scale(1.05);
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

/* 图片相关样式 */
.post-images {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
  width: 100%;
}

.post-images[data-count="1"] {
  grid-template-columns: 1fr;
  max-width: 400px;
}

.post-images[data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  max-width: 500px;
}

.post-images[data-count="3"] {
  grid-template-columns: repeat(3, 1fr);
  max-width: 600px;
}

.post-images[data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-width: 500px;
}

.post-image {
  width: 100%;
  height: 60px;
  max-height: 100px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  object-fit: cover;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: block;
}

.post-image:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 针对不同数量图片的高度优化 */
.post-images[data-count="1"] .post-image {
  height: 80px;
}

.post-images[data-count="2"] .post-image {
  height: 60px;
}

.post-images[data-count="3"] .post-image {
  height: 50px;
}

.post-images[data-count="4"] .post-image {
  height: 40px;
}

.post-actions {
  display: flex !important;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  visibility: visible !important;
  opacity: 1 !important;
  position: relative !important;
  z-index: 10 !important;
  flex-shrink: 0;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #666;
  font-size: 0.95em;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover {
  background: rgba(64, 191, 255, 0.15);
  color: var(--color-blue);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 191, 255, 0.2);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn.active {
  color: var(--color-blue);
  background: rgba(64, 191, 255, 0.15);
  box-shadow: 0 4px 12px rgba(64, 191, 255, 0.2);
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
  border: 1px solid var(--color-gray-light);
  transition: all 0.2s ease;
}

.comment-avatar:hover {
  border-color: var(--color-blue);
  transform: scale(1.05);
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
    grid-template-columns: 1fr !important;
  }
  
  .post-images .post-image {
    height: 200px !important;
  }
  
  .post-header .el-avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  .comment-avatar {
    width: 28px !important;
    height: 28px !important;
  }
}

/* 图片覆盖层样式 */
.post-image-wrapper {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 8px;
  display: block;
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;
}

.image-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.post-image-wrapper:hover .image-overlay {
  opacity: 1;
}
</style> 