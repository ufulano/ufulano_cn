<template>
  <section class="new-post-section">
    <el-card class="new-post-card">
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
      
      <!-- 图片预览 -->
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
      
      <!-- 新建帖子操作栏 -->
      <div v-if="showActions" class="new-post-actions">
        <div class="new-post-tools">
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
          
          <el-input
            v-model="topics"
            placeholder="添加话题..."
            class="new-post-topics"
            size="small"
          />
        </div>
        
        <div class="new-post-publish">
          <el-select v-model="visibility" size="small" class="new-post-visibility">
            <el-option label="公开" value="public" />
            <el-option label="仅粉丝" value="follower" />
            <el-option label="仅自己" value="private" />
          </el-select>
          <el-button 
            type="primary" 
            @click="handlePublish"
            :loading="publishing"
            :disabled="!content.trim()"
            class="new-post-publish-btn"
          >
            发布
          </el-button>
        </div>
      </div>
    </el-card>
  </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { PictureFilled, Close } from '@element-plus/icons-vue'
import AvatarUpload from './AvatarUpload.vue'
import { parseAvatar } from '../utils/avatar'

const props = defineProps({
  avatar: {
    type: String,
    default: ''
  },
  publishing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['publish'])

// 组件内部状态
const content = ref('')
const images = ref([])
const topics = ref('')
const visibility = ref('public')
const showActions = ref(false)

// 表情列表
const emojiList = [
  '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😍','😘','😜','😎','😭','😡','👍','👏','🎉','❤️','🔥','🌈','🐱','🐶','🍉','🍔','⚽','🏀','🚗','✈️','🎵','💡','⭐'
]

// 图片上传处理
const onImageChange = (file) => {
  if (images.value.length >= 4) {
    ElMessage.warning('最多只能上传4张图片')
    return
  }
  
  const reader = new FileReader()
  reader.onload = e => {
    images.value.push(e.target.result)
  }
  reader.readAsDataURL(file.raw)
}

// 移除图片
const removeImage = (index) => {
  images.value.splice(index, 1)
}

// 插入表情
const insertEmoji = (emoji) => {
  content.value += emoji
}

// 发布帖子
const handlePublish = () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  
  const payload = {
    content: content.value,
    images: images.value,
    topics: topics.value.split(',').map(t => t.trim()).filter(Boolean),
    visibility: visibility.value
  }
  
  emit('publish', payload)
  
  // 重置表单
  content.value = ''
  images.value = []
  topics.value = ''
  visibility.value = 'public'
  showActions.value = false
}

// 监听内容变化，自动显示操作栏
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