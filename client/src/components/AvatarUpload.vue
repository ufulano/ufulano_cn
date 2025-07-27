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
        :src="tempImageUrl"
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
const defaultAvatar = 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像'

// 当前头像
const currentAvatar = computed(() => {
  console.log('AvatarUpload - props.avatar:', props.avatar ? '存在' : '不存在')
  console.log('AvatarUpload - userStore.avatar:', userStore.avatar ? '存在' : '不存在')
  
  if (props.avatar && props.avatar.trim()) {
    return props.avatar
  }
  if (userStore.avatar && userStore.avatar.trim()) {
    return userStore.avatar
  }
  return defaultAvatar
})

// 处理文件选择
const handleFileChange = (file) => {
  if (!props.editable) {
    ElMessage.warning('头像不可编辑')
    return
  }
  
  // 验证文件类型和大小
  const isImage = file.raw.type.startsWith('image/')
  const isLt2M = file.raw.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  // 显示裁剪对话框
  const reader = new FileReader()
  reader.onload = (e) => {
    tempImageUrl.value = e.target.result
    showCropper.value = true
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
    const croppedData = cropperRef.value.getCropResult()
    if (!croppedData) {
      ElMessage.error('请先裁剪图片')
      return
    }

    // 上传头像
    const response = await updateUserAvatar(croppedData)
    
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