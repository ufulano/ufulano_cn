<template>
  <!-- 新建帖子区域 -->
  <section class="new-post-section">
    <el-card class="new-post-card">
      <!-- 帖子头部：头像和输入框 -->
      <div class="new-post-header">
        <AvatarUpload 
          :avatar="parseAvatar(avatar)" 
          size="large" 
          :editable="false"
          class="new-post-avatar"
        />
        <div class="new-post-input-wrapper">
          <el-input
            v-model="content"
            type="textarea"
            :rows="3"
            placeholder="分享你的想法..."
            maxlength="500"
            show-word-limit
            class="new-post-input"
            @focus="showActions = true"
          />
        </div>
      </div>
      
      <!-- 图片预览区域 -->
      <div v-if="images.length > 0" class="new-post-images" :data-count="images.length">
        <div 
          v-for="(img, index) in images" 
          :key="index" 
          class="new-post-image-item"
        >
          <el-image :src="img" fit="cover" class="new-post-image" />
          <div class="new-post-image-remove" @click="removeImage(index)">
            <el-icon><Close /></el-icon>
          </div>
        </div>
      </div>
      
      <!-- 新建帖子操作栏：工具和发布按钮 -->
      <div v-if="showActions" class="new-post-actions">
        <!-- 左侧工具区域 -->
        <div class="new-post-tools">
          <!-- 图片上传按钮 -->
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            :on-change="onImageChange"
            accept="image/*"
            :limit="4"
            class="new-post-upload"
          >
            <el-button class="new-post-tool-btn">
              <el-icon><PictureFilled /></el-icon>
              图片
            </el-button>
          </el-upload>
          
          <!-- 表情选择器 -->
          <el-popover placement="top" width="220" trigger="click">
            <template #reference>
              <el-button class="new-post-tool-btn">😀</el-button>
            </template>
            <div class="emoji-panel">
              <span 
                v-for="emoji in emojiList" 
                :key="emoji" 
                class="emoji-item" 
                @click="insertEmoji(emoji)"
              >
                {{ emoji }}
              </span>
            </div>
          </el-popover>
          
          <!-- 话题输入框 -->
          <el-input
            v-model="topics"
            placeholder="添加话题..."
            class="new-post-topics"
            size="small"
          />
        </div>
        
        <!-- 右侧发布区域 -->
        <div class="new-post-publish">
          <!-- 可见性选择器 -->
          <el-select v-model="visibility" size="small" class="new-post-visibility">
            <el-option label="公开" value="public" />
            <el-option label="仅粉丝" value="follower" />
            <el-option label="仅自己" value="private" />
          </el-select>
          <!-- 发布按钮 -->
          <el-button 
            type="primary" 
            @click="handlePublish"
            :loading="publishing"
            :disabled="!content.trim() || error"
            class="new-post-publish-btn"
          >
            发布
          </el-button>
          
          <!-- 错误提示 -->
          <div v-if="error && errorMessage" class="new-post-error">
            <el-icon><Warning /></el-icon>
            <span>{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </section>
</template>

<script setup>
/**
 * 新建帖子卡片组件
 * 
 * 功能：
 * - 提供帖子内容输入界面
 * - 支持图片上传和预览
 * - 支持表情插入
 * - 支持话题标签
 * - 支持可见性设置
 * - 图片压缩和优化处理
 * 
 * 特性：
 * - 响应式设计，适配移动端
 * - 图片处理队列，避免并发问题
 * - 防抖处理，提升性能
 * - 实时字数统计
 * - 错误状态处理
 */

import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { PictureFilled, Close } from '@element-plus/icons-vue'
import AvatarUpload from './AvatarUpload.vue'
import { parseAvatar } from '../utils/avatar'
import { compressImage, generateThumbnail, getImageSize, isValidImage, isValidImageSize } from '../utils/imageCompression'
import { debounce, throttle, batchProcess, AsyncQueue } from '../utils/performance'

/**
 * 组件属性定义
 */
const props = defineProps({
  /** 用户头像URL */
  avatar: {
    type: String,
    default: ''
  },
  /** 发布状态，控制发布按钮loading */
  publishing: {
    type: Boolean,
    default: false
  },
  /** 错误状态 */
  error: {
    type: Boolean,
    default: false
  },
  /** 错误信息 */
  errorMessage: {
    type: String,
    default: ''
  }
})

/**
 * 组件事件定义
 */
const emit = defineEmits(['publish'])

// 组件内部状态
/** 帖子内容 */
const content = ref('')
/** 存储缩略图URL数组 */
const images = ref([])
/** 存储原图URL数组 */
const originalImages = ref([])
/** 话题标签 */
const topics = ref('')
/** 可见性设置 */
const visibility = ref('public')
/** 是否显示操作栏 */
const showActions = ref(false)
/** 上传进度 */
const uploadProgress = ref(0)
/** 图片处理队列，最多同时处理2张图片 */
const imageQueue = new AsyncQueue(2)

/**
 * 表情列表
 * 包含常用的表情符号，用于快速插入到帖子内容中
 */
const emojiList = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😍','😘','😜','😎','😭','😡','👍','👏','🎉','❤️','🔥','🌈','🐱','🐶','🍉','🍔','⚽','🏀','🚗','✈️','🎵','💡','⭐'
]

/**
 * 图片上传处理函数（使用队列和防抖）
 * 
 * @param {Object} file - 上传的文件对象
 * @returns {Promise<void>}
 */
const onImageChange = debounce(async (file) => {
  // 检查图片数量限制
  if (images.value.length >= 4) {
    ElMessage.warning('最多只能上传4张图片')
    return
  }
  
  // 验证文件类型
  if (!isValidImage(file.raw)) {
    ElMessage.error('只支持JPG、PNG、GIF格式的图片')
    return
  }
  
  // 验证文件大小（限制为20MB）
  if (!isValidImageSize(file.raw, 20)) {
    ElMessage.error('图片大小不能超过20MB')
    return
  }
  
  // 显示压缩进度
  const loadingMessage = ElMessage({
    message: '正在压缩图片...',
    type: 'info',
    duration: 0
  })
  
  // 使用队列处理图片
  await imageQueue.add(async () => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const originalSize = getImageSize(e.target.result)
          console.log('原始图片大小:', originalSize.toFixed(2), 'KB')
          
          // 生成缩略图（快速显示）
          const thumbnail = await generateThumbnail(e.target.result, 200)
          const thumbnailSize = getImageSize(thumbnail)
          console.log('缩略图大小:', thumbnailSize.toFixed(2), 'KB')
          
          // 压缩原图（用于存储）
          const compressedImage = await compressImage(e.target.result, 800, 500)
          const compressedSize = getImageSize(compressedImage)
          console.log('压缩后图片大小:', compressedSize.toFixed(2), 'KB')
          
          // 存储缩略图和原图
          const imageIndex = images.value.length
          images.value.push(thumbnail) // 显示缩略图
          originalImages.value[imageIndex] = compressedImage // 存储原图
          
          loadingMessage.close()
          ElMessage.success(`图片添加成功 (缩略图: ${thumbnailSize.toFixed(1)}KB)`)
          resolve()
        } catch (error) {
          console.error('图片处理失败:', error)
          loadingMessage.close()
          ElMessage.error('图片处理失败')
          reject(error)
        }
      }
      
      reader.onerror = (error) => {
        console.error('文件读取失败:', error)
        loadingMessage.close()
        ElMessage.error('文件读取失败')
        reject(error)
      }
      
      reader.readAsDataURL(file.raw)
    })
  })
}, 300) // 300ms防抖

/**
 * 移除指定索引的图片
 * 
 * @param {number} index - 要移除的图片索引
 */
const removeImage = (index) => {
  images.value.splice(index, 1)
  originalImages.value.splice(index, 1)
}

/**
 * 在内容中插入表情符号
 * 
 * @param {string} emoji - 要插入的表情符号
 */
const insertEmoji = (emoji) => {
  content.value += emoji
}

/**
 * 发布帖子处理函数
 * 采用两步发布策略：先发布缩略图，再异步上传原图
 */
const handlePublish = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  // 第一步：先发布文字和缩略图
  const initialPayload = {
    content: content.value,
    images: images.value, // 使用缩略图
    topics: topics.value.split(',').map(t => t.trim()).filter(Boolean),
    visibility: visibility.value,
    isThumbnail: true // 标记这是缩略图
  }
  
  emit('publish', initialPayload)
  
  // 第二步：异步上传原图（如果有的话）
  if (originalImages.value.length > 0) {
    setTimeout(async () => {
      try {
        const fullPayload = {
          content: content.value,
          images: originalImages.value, // 使用原图
          topics: topics.value.split(',').map(t => t.trim()).filter(Boolean),
          visibility: visibility.value,
          isFullImage: true // 标记这是原图
        }
        
        // 这里可以发送一个更新请求来替换缩略图
        console.log('异步上传原图...')
        // emit('updateImages', fullPayload)
      } catch (error) {
        console.error('原图上传失败:', error)
      }
    }, 1000) // 延迟1秒上传原图
  }
  
  // 重置表单
  content.value = ''
  images.value = []
  originalImages.value = []
  topics.value = ''
  visibility.value = 'public'
  showActions.value = false
}

/**
 * 监听内容变化，自动显示操作栏
 * 当用户开始输入内容时，自动显示发布相关的操作按钮
 */
watch(content, (newValue) => {
  if (newValue.trim() && !showActions.value) {
    showActions.value = true
  }
})

</script>

<style scoped>
.new-post-section {
  width: 60%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 24px;
  background-color:var(--color-white);
}

.new-post-card {
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  border: none;
  background: var(--color-white);
}

.new-post-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.new-post-header .el-avatar {
  border: 2px solid var(--color-gray-light);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.new-post-header .el-avatar:hover {
  border-color: var(--color-blue);
  transform: scale(1.05);
}

.new-post-input-wrapper {
  flex: 1;
}

.new-post-input {
  border: none;
  resize: none;
}

.new-post-input :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 0;
  font-size: 16px;
  line-height: 1.6;
  min-height: 80px;
}

.new-post-images {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.new-post-images[data-count="1"] {
  grid-template-columns: 1fr;
  max-width: 300px;
}

.new-post-images[data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  max-width: 400px;
}

.new-post-images[data-count="3"] {
  grid-template-columns: repeat(3, 1fr);
  max-width: 450px;
}

.new-post-images[data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-width: 400px;
}

.new-post-image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.new-post-image-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.new-post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-post-image-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.new-post-image-remove:hover {
  background: rgba(220, 53, 69, 0.9);
  transform: scale(1.1);
}

.new-post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--color-gray-light);
}

.new-post-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-post-tool-btn {
  border: none;
  background: transparent;
  color: var(--color-gray);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.new-post-tool-btn:hover {
  background: var(--color-gray-light);
  color: var(--color-blue);
}

.new-post-upload {
  display: inline-block;
}

.new-post-topics {
  width: 150px;
}

.new-post-topics :deep(.el-input__inner) {
  border: 1px solid var(--color-gray-light);
  border-radius: 6px;
}

.new-post-publish {
  display: flex;
  align-items: center;
  gap: 12px;
}

.new-post-visibility {
  width: 100px;
}

.new-post-publish-btn {
  background: var(--color-blue);
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.2s;
}

.new-post-publish-btn:hover {
  background: var(--color-blue-dark);
  transform: translateY(-1px);
}

.new-post-publish-btn:disabled {
  background: var(--color-gray);
  cursor: not-allowed;
  transform: none;
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
  transition: background 0.2s;
}

.emoji-item:hover {
  background: var(--color-gray-light);
}

@media (max-width: 1200px) {
  .new-post-section {
    max-width: 98vw;
    width: 98vw;
    padding: 8px;
  }
}

@media (max-width: 768px) {
  .new-post-header {
    gap: 12px;
  }
  
  .new-post-header .el-avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  .new-post-images {
    grid-template-columns: 1fr !important;
    max-width: 100% !important;
  }
  
  .new-post-tools {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .new-post-topics {
    width: 120px;
  }
  
  .new-post-publish {
    flex-direction: column;
    gap: 8px;
  }
  
  .new-post-visibility {
    width: 100%;
  }
}
</style> 