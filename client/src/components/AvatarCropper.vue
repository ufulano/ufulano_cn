<template>
  <div class="avatar-cropper">
    <div class="cropper-container" ref="containerRef">
      <img 
        :src="imageSrc" 
        ref="imageRef"
        class="cropper-image"
        @load="onImageLoad"
        @error="onImageError"
        @mousedown="startDrag"
        @touchstart="startDrag"
      />
      
      <!-- 剪裁框 -->
      <div 
        class="crop-frame"
        :style="cropFrameStyle"
        @mousedown="startResize"
        @touchstart="startResize"
      >
        <!-- 调整大小的手柄 -->
        <div class="resize-handle resize-handle-nw"></div>
        <div class="resize-handle resize-handle-ne"></div>
        <div class="resize-handle resize-handle-sw"></div>
        <div class="resize-handle resize-handle-se"></div>
      </div>
      
      <!-- 遮罩层 -->
      <div class="crop-overlay">
        <div class="crop-hole" :style="cropHoleStyle"></div>
      </div>
    </div>
    
    <!-- 控制面板 -->
    <div class="cropper-controls">
      <div class="control-group">
        <label>缩放</label>
        <el-slider 
          v-model="scale" 
          :min="0.5" 
          :max="3" 
          :step="0.1"
          @change="updateTransform"
          style="width: 200px;"
        />
        <span class="scale-value">{{ scale.toFixed(1) }}x</span>
      </div>
      
      <div class="control-group">
        <label>旋转</label>
        <el-slider 
          v-model="rotation" 
          :min="-180" 
          :max="180" 
          :step="15"
          @change="updateTransform"
          style="width: 200px;"
        />
        <span class="rotation-value">{{ rotation }}°</span>
      </div>
      
      <div class="control-buttons">
        <el-button @click="resetTransform">重置</el-button>
        <el-button @click="rotateLeft">向左旋转</el-button>
        <el-button @click="rotateRight">向右旋转</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  imageSrc: {
    type: String,
    required: true
  },
  cropSize: {
    type: Number,
    default: 200
  }
})

const emit = defineEmits(['crop'])

// 响应式数据
const containerRef = ref(null)
const imageRef = ref(null)
const scale = ref(1)
const rotation = ref(0)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const isResizing = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const imageSize = ref({ width: 0, height: 0 })

// 计算样式
const cropFrameStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  width: `${props.cropSize}px`,
  height: `${props.cropSize}px`
}))

const cropHoleStyle = computed(() => ({
  width: `${props.cropSize}px`,
  height: `${props.cropSize}px`,
  left: `${position.value.x}px`,
  top: `${position.value.y}px`
}))

// 图片加载完成
const onImageLoad = () => {
  const img = imageRef.value
  if (img) {
    console.log('图片加载完成:', img.naturalWidth, 'x', img.naturalHeight)
    imageSize.value = {
      width: img.naturalWidth,
      height: img.naturalHeight
    }
    
    // 居中定位剪裁框
    centerCropFrame()
  }
}

// 图片加载错误
const onImageError = (error) => {
  console.error('图片加载失败:', error)
  console.error('图片源:', props.imageSrc)
}

// 居中剪裁框
const centerCropFrame = () => {
  if (!containerRef.value) return
  
  const container = containerRef.value
  const containerRect = container.getBoundingClientRect()
  
  position.value = {
    x: (containerRect.width - props.cropSize) / 2,
    y: (containerRect.height - props.cropSize) / 2
  }
}

// 更新变换
const updateTransform = () => {
  if (!imageRef.value) return
  
  const img = imageRef.value
  img.style.transform = `scale(${scale.value}) rotate(${rotation.value}deg)`
}

// 重置变换
const resetTransform = () => {
  scale.value = 1
  rotation.value = 0
  centerCropFrame()
  updateTransform()
}

// 旋转
const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360
  updateTransform()
}

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360
  updateTransform()
}

// 拖拽开始
const startDrag = (e) => {
  if (e.target.classList.contains('crop-frame') || e.target.classList.contains('resize-handle')) {
    return
  }
  
  isDragging.value = true
  const point = getEventPoint(e)
  dragStart.value = {
    x: point.x - position.value.x,
    y: point.y - position.value.y
  }
  
  e.preventDefault()
}

// 调整大小开始
const startResize = (e) => {
  isResizing.value = true
  const point = getEventPoint(e)
  dragStart.value = {
    x: point.x,
    y: point.y
  }
  
  e.preventDefault()
  e.stopPropagation()
}

// 获取事件坐标
const getEventPoint = (e) => {
  const rect = containerRef.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY
  
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
}

// 鼠标/触摸移动
const onMove = (e) => {
  if (!isDragging.value && !isResizing.value) return
  
  const point = getEventPoint(e)
  
  if (isDragging.value) {
    position.value = {
      x: point.x - dragStart.value.x,
      y: point.y - dragStart.value.y
    }
  }
  
  // 限制剪裁框在容器内
  constrainCropFrame()
  
  e.preventDefault()
}

// 限制剪裁框范围
const constrainCropFrame = () => {
  if (!containerRef.value) return
  
  const container = containerRef.value
  const containerRect = container.getBoundingClientRect()
  
  position.value.x = Math.max(0, Math.min(position.value.x, containerRect.width - props.cropSize))
  position.value.y = Math.max(0, Math.min(position.value.y, containerRect.height - props.cropSize))
}

// 鼠标/触摸结束
const onEnd = () => {
  isDragging.value = false
  isResizing.value = false
}

// 获取剪裁结果
const getCropResult = () => {
  if (!imageRef.value || !containerRef.value) return null
  
  try {
    // 创建canvas进行裁剪
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // 设置canvas大小为裁剪框大小
    canvas.width = props.cropSize
    canvas.height = props.cropSize
    
    const img = imageRef.value
    const container = containerRef.value
    const containerRect = container.getBoundingClientRect()
    
    // 计算实际的裁剪区域（考虑缩放和旋转）
    const scaleX = img.naturalWidth / containerRect.width
    const scaleY = img.naturalHeight / containerRect.height
    
    // 考虑图片的缩放
    const actualScaleX = scaleX / scale.value
    const actualScaleY = scaleY / scale.value
    
    const cropX = position.value.x * actualScaleX
    const cropY = position.value.y * actualScaleY
    const cropWidth = props.cropSize * actualScaleX
    const cropHeight = props.cropSize * actualScaleY
    
    // 如果有旋转，需要先旋转图片
    if (rotation.value !== 0) {
      // 保存当前状态
      ctx.save()
      
      // 移动到canvas中心
      ctx.translate(canvas.width / 2, canvas.height / 2)
      
      // 旋转
      ctx.rotate((rotation.value * Math.PI) / 180)
      
      // 绘制图片（从中心开始）
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,  // 源图片裁剪区域
        -props.cropSize / 2, -props.cropSize / 2, props.cropSize, props.cropSize  // 目标canvas区域
      )
      
      // 恢复状态
      ctx.restore()
    } else {
      // 直接绘制裁剪后的图片
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,  // 源图片裁剪区域
        0, 0, props.cropSize, props.cropSize   // 目标canvas区域
      )
    }
    
    // 返回base64数据
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('裁剪失败:', error)
    return null
  }
}

// 暴露方法
defineExpose({
  getCropResult
})

// 事件监听
onMounted(() => {
  document.addEventListener('mousemove', onMove)
  document.addEventListener('touchmove', onMove, { passive: false })
  document.addEventListener('mouseup', onEnd)
  document.addEventListener('touchend', onEnd)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMove)
  document.removeEventListener('touchmove', onMove)
  document.removeEventListener('mouseup', onEnd)
  document.removeEventListener('touchend', onEnd)
})
</script>

<style scoped>
.avatar-cropper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cropper-container {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
}

.cropper-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.crop-frame {
  position: absolute;
  border: 2px solid white;
  border-radius: 50%;
  cursor: move;
  z-index: 10;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
}

.resize-handle-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.resize-handle-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-handle-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.resize-handle-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.crop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.crop-hole {
  position: absolute;
  border-radius: 50%;
  box-shadow: inset 0 0 0 9999px rgba(0, 0, 0, 0.5);
}

.cropper-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-group label {
  color: var(--color-gray-dark);
  font-size: 14px;
  font-weight: 500;
  min-width: 40px;
}

.scale-value,
.rotation-value {
  color: var(--color-gray);
  font-size: 14px;
  min-width: 50px;
  text-align: right;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cropper-container {
    width: 300px;
    height: 300px;
  }
  
  .control-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .control-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style> 