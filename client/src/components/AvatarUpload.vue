<template>
  <div class="avatar-upload">
    <el-upload
      v-if="editable"
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      accept="image/*"
      class="avatar-uploader"
    >
      <div class="avatar-wrapper">
        <el-avatar 
          :src="currentAvatar" 
          :size="size"
          class="avatar-preview"
        />
        <div class="avatar-overlay">
          <el-icon><Camera /></el-icon>
          <span>更换头像</span>
        </div>
      </div>
    </el-upload>
    
    <!-- 只显示头像，不可编辑 -->
    <div v-else class="avatar-display">
      <el-avatar 
        :src="currentAvatar" 
        :size="size"
        class="avatar-preview"
      />
    </div>
    
    <!-- 头像裁剪对话框 -->
    <el-dialog 
      v-model="showCropper" 
      title="裁剪头像" 
      width="600px"
      :close-on-click-modal="false"
    >
      <AvatarCropper 
        ref="cropperRef"
        :image-src="tempImageUrl"
        @crop-complete="handleCropComplete"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCropper = false">取消</el-button>
          <el-button type="primary" @click="confirmCrop" :loading="uploading">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import AvatarCropper from './AvatarCropper.vue'
import { updateUserAvatar } from '../api/user.js'
import { useUserStore } from '../store/user.js'
import { parseAvatar } from '../utils/avatar'
import { isValidImage, isValidImageSize, compressImage, getImageSize } from '../utils/imageCompression'

const props = defineProps({
  avatar: {
    type: String,
    default: ''
  },
  size: {
    type: [String, Number],
    default: 'large'
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:avatar', 'avatar-changed'])

const userStore = useUserStore()
const cropperRef = ref(null)
const showCropper = ref(false)
const tempImageUrl = ref('')
const uploading = ref(false)

// 默认头像 - 使用简单的占位符
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='

// 当前头像
const currentAvatar = computed(() => {
  console.log('AvatarUpload - props.avatar:', props.avatar ? '存在' : '不存在')
  console.log('AvatarUpload - userStore.avatar:', userStore.avatar ? '存在' : '不存在')
  
  const avatarData = props.avatar || userStore.avatar
  const parsedAvatar = parseAvatar(avatarData)
  
  console.log('解析后的头像:', parsedAvatar.substring(0, 50) + '...')
  return parsedAvatar
})

// 处理文件选择（自动压缩）
const handleFileChange = async (file) => {
  if (!props.editable) {
    ElMessage.warning('头像不可编辑')
    return
  }
  
  // 验证文件类型
  if (!isValidImage(file.raw)) {
    ElMessage.error('只能上传JPG、PNG、GIF格式的图片文件!')
    return
  }
  
  // 移除文件大小限制，让用户不用担心大小
  console.log('原始文件大小:', (file.raw.size / 1024).toFixed(2), 'KB')
  
  // 显示处理进度
  const loadingMessage = ElMessage({
    message: '正在处理图片...',
    type: 'info',
    duration: 0
  })
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const originalSize = getImageSize(e.target.result)
      console.log('原始图片大小:', originalSize.toFixed(2), 'KB')
      
      // 自动压缩图片（如果太大）
      let processedImage = e.target.result
      if (originalSize > 500) { // 如果大于500KB，进行压缩
        processedImage = await compressImage(e.target.result, 400, 200)
        const compressedSize = getImageSize(processedImage)
        console.log('压缩后图片大小:', compressedSize.toFixed(2), 'KB')
      }
      
      // 显示裁剪对话框
      tempImageUrl.value = processedImage
      showCropper.value = true
      
      loadingMessage.close()
    } catch (error) {
      console.error('图片处理失败:', error)
      loadingMessage.close()
      ElMessage.error('图片处理失败')
    }
  }
  
  reader.onerror = (error) => {
    console.error('文件读取失败:', error)
    loadingMessage.close()
    ElMessage.error('文件读取失败')
  }
  
  reader.readAsDataURL(file.raw)
}

// 处理裁剪完成
const handleCropComplete = (croppedData) => {
  // 裁剪完成，可以在这里预览
  console.log('裁剪完成:', croppedData)
}

// 确认裁剪并上传
const confirmCrop = async () => {
  if (!cropperRef.value) {
    ElMessage.error('裁剪器未初始化')
    return
  }

  uploading.value = true
  try {
    const croppedImageData = cropperRef.value.getCropResult()
    if (!croppedImageData) {
      ElMessage.error('裁剪失败，请重试')
      return
    }

    console.log('裁剪后的图片数据长度:', croppedImageData.length)

    // 上传头像
    const response = await updateUserAvatar(croppedImageData)
    
    // 更新用户store
    userStore.updateAvatar(response.avatar_url)
    
    // 触发事件
    emit('update:avatar', response.avatar_url)
    emit('avatar-changed', response.avatar_url)
    
    ElMessage.success('头像更新成功')
    showCropper.value = false
  } catch (error) {
    console.error('上传头像失败:', error)
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.avatar-upload {
  display: inline-block;
}

.avatar-uploader {
  cursor: pointer;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-display {
  display: inline-block;
}

.avatar-preview {
  display: block;
  border: 2px solid var(--color-gray-light);
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.dialog-footer {
  text-align: right;
}
</style> 