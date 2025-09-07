<template>
  <div class="lazy-image-container" :style="containerStyle">
    <!-- 占位符 -->
    <div 
      v-if="!loaded && !error" 
      class="image-placeholder"
      :class="{ 'placeholder-loading': loading }"
    >
      <div class="placeholder-content">
        <el-icon v-if="loading" class="loading-icon"><Loading /></el-icon>
        <el-icon v-else class="placeholder-icon"><PictureFilled /></el-icon>
        <span v-if="loading" class="placeholder-text">加载中...</span>
        <span v-else class="placeholder-text">点击加载图片</span>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="image-error" @click="retryLoad">
      <div class="error-content">
        <el-icon class="error-icon"><Warning /></el-icon>
        <span class="error-text">加载失败，点击重试</span>
      </div>
    </div>
    
    <!-- 实际图片 -->
    <img
      v-else
      :src="actualSrc"
      :alt="alt"
      :style="imageStyle"
      class="lazy-image"
      @load="onImageLoad"
      @error="onImageError"
      @click="handleClick"
    />
    
    <!-- 加载进度条 -->
    <div v-if="loading && showProgress" class="loading-progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
/**
 * LazyImage 组件 - 懒加载图片组件
 * 
 * 功能：
 * - 图片懒加载：只在进入视口时加载
 * - 加载状态管理：显示加载中、错误、成功状态
 * - 重试机制：加载失败时可以重试
 * - 性能优化：避免不必要的图片加载
 * 
 * 特性：
 * - 支持 Intersection Observer
 * - 可配置占位符样式
 * - 支持加载进度显示
 * - 响应式设计
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { PictureFilled, Loading, Warning } from '@element-plus/icons-vue'

const props = defineProps({
  /** 图片源 */
  src: {
    type: String,
    required: true
  },
  /** 图片描述 */
  alt: {
    type: String,
    default: ''
  },
  /** 容器宽度 */
  width: {
    type: [String, Number],
    default: '100%'
  },
  /** 容器高度 */
  height: {
    type: [String, Number],
    default: 'auto'
  },
  /** 是否立即加载 */
  immediate: {
    type: Boolean,
    default: false
  },
  /** 是否显示加载进度 */
  showProgress: {
    type: Boolean,
    default: false
  },
  /** 占位符背景色 */
  placeholderColor: {
    type: String,
    default: '#f5f5f5'
  },
  /** 图片对象适应方式 */
  objectFit: {
    type: String,
    default: 'cover'
  }
})

const emit = defineEmits(['load', 'error', 'click'])

// 响应式状态
const loaded = ref(false)
const loading = ref(false)
const error = ref(false)
const progress = ref(0)
const inView = ref(false)
const observer = ref(null)

// 计算属性
const actualSrc = computed(() => {
  if (props.immediate || inView.value) {
    return props.src
  }
  return ''
})

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  backgroundColor: props.placeholderColor
}))

const imageStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: props.objectFit
}))

// 方法
const startLoading = () => {
  if (loading.value || loaded.value) return
  
  loading.value = true
  error.value = false
  progress.value = 0
  
  // 模拟加载进度
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 10
    }
  }, 100)
  
  // 图片加载完成后清除定时器
  const checkLoaded = () => {
    if (loaded.value) {
      clearInterval(progressInterval)
      progress.value = 100
    }
  }
  
  // 监听加载状态
  const unwatch = watch(loaded, checkLoaded)
  
  // 5秒后强制清除定时器
  setTimeout(() => {
    clearInterval(progressInterval)
    unwatch()
  }, 5000)
}

const onImageLoad = () => {
  loaded.value = true
  loading.value = false
  error.value = false
  progress.value = 100
  emit('load', props.src)
}

const onImageError = () => {
  loaded.value = false
  loading.value = false
  error.value = true
  progress.value = 0
  emit('error', props.src)
}

const retryLoad = () => {
  error.value = false
  loaded.value = false
  startLoading()
}

const handleClick = () => {
  emit('click', props.src)
}

// 设置 Intersection Observer
const setupObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // 不支持 Intersection Observer，立即加载
    inView.value = true
    startLoading()
    return
  }
  
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          inView.value = true
          startLoading()
          // 加载后停止观察
          if (observer.value) {
            observer.value.unobserve(entry.target)
          }
        }
      })
    },
    {
      rootMargin: '50px' // 提前50px开始加载
    }
  )
  
  // 开始观察
  const container = document.querySelector('.lazy-image-container')
  if (container && observer.value) {
    observer.value.observe(container)
  }
}

// 生命周期
onMounted(() => {
  if (props.immediate) {
    inView.value = true
    startLoading()
  } else {
    setupObserver()
  }
})

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

// 监听 src 变化
watch(() => props.src, () => {
  if (inView.value) {
    loaded.value = false
    error.value = false
    startLoading()
  }
})
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.image-placeholder,
.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-placeholder:hover,
.image-error:hover {
  background: rgba(0, 0, 0, 0.05);
}

.placeholder-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.loading-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.placeholder-icon,
.error-icon {
  font-size: 24px;
}

.placeholder-text,
.error-text {
  font-size: 12px;
}

.lazy-image {
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.lazy-image:hover {
  opacity: 0.9;
}

.loading-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  transition: width 0.3s ease;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.placeholder-loading {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

