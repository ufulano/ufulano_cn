<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h3>性能监控</h3>
      <el-button @click="toggleMonitor" size="small" type="primary">隐藏</el-button>
    </div>
    
    <div class="monitor-content">
      <!-- 基本信息 -->
      <div class="monitor-section">
        <h4>基本信息</h4>
        <div class="info-item">
          <span>帖子数量:</span>
          <span>{{ postCount }}</span>
        </div>
        <div class="info-item">
          <span>图片数量:</span>
          <span>{{ imageCount }}</span>
        </div>
        <div class="info-item">
          <span>内存使用:</span>
          <span>{{ memoryUsage }}</span>
        </div>
        <div class="info-item">
          <span>FPS:</span>
          <span :class="{ 'fps-warning': fps < 30 }">{{ fps }}</span>
        </div>
      </div>
      
      <!-- 加载时间 -->
      <div class="monitor-section">
        <h4>加载时间</h4>
        <div class="info-item">
          <span>首屏加载:</span>
          <span>{{ firstScreenTime }}ms</span>
        </div>
        <div class="info-item">
          <span>图片加载:</span>
          <span>{{ imageLoadTime }}ms</span>
        </div>
        <div class="info-item">
          <span>总加载时间:</span>
          <span>{{ totalLoadTime }}ms</span>
        </div>
      </div>
      
      <!-- 性能指标 -->
      <div class="monitor-section">
        <h4>性能指标</h4>
        <div class="info-item">
          <span>DOM节点数:</span>
          <span>{{ domNodes }}</span>
        </div>
        <div class="info-item">
          <span>事件监听器:</span>
          <span>{{ eventListeners }}</span>
        </div>
        <div class="info-item">
          <span>缓存命中率:</span>
          <span>{{ cacheHitRate }}%</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="monitor-actions">
        <el-button @click="clearCache" size="small" type="warning">清除缓存</el-button>
        <el-button @click="forceGC" size="small" type="info">强制GC</el-button>
        <el-button @click="exportReport" size="small" type="success">导出报告</el-button>
      </div>
    </div>
  </div>
  
  <!-- 浮动按钮 -->
  <div v-else class="monitor-toggle" @click="toggleMonitor">
    <el-icon><Monitor /></el-icon>
  </div>
</template>

<script setup>
/**
 * PerformanceMonitor 组件 - 性能监控面板
 * 
 * 功能：
 * - 实时性能监控：FPS、内存使用、加载时间
 * - 性能指标统计：DOM节点、事件监听器、缓存命中率
 * - 性能优化建议：基于监控数据提供优化建议
 * - 调试工具：清除缓存、强制GC、导出报告
 * 
 * 特性：
 * - 可折叠界面：不影响正常使用
 * - 实时更新：性能数据实时刷新
 * - 开发模式：仅在开发环境显示
 * - 数据导出：支持性能报告导出
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  /** 帖子数量 */
  postCount: {
    type: Number,
    default: 0
  },
  /** 图片数量 */
  imageCount: {
    type: Number,
    default: 0
  }
})

// 响应式数据
const showMonitor = ref(false)
const fps = ref(0)
const memoryUsage = ref('0 MB')
const firstScreenTime = ref(0)
const imageLoadTime = ref(0)
const totalLoadTime = ref(0)
const domNodes = ref(0)
const eventListeners = ref(0)
const cacheHitRate = ref(0)

// 性能监控相关
let frameCount = 0
let lastTime = performance.now()
let fpsInterval = null
let memoryInterval = null

// 计算属性
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development'
})

// 方法
const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value
}

const updateFPS = () => {
  frameCount++
  const currentTime = performance.now()
  
  if (currentTime - lastTime >= 1000) {
    fps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
    frameCount = 0
    lastTime = currentTime
  }
  
  requestAnimationFrame(updateFPS)
}

const updateMemory = () => {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize
    const total = performance.memory.totalJSHeapSize
    const limit = performance.memory.jsHeapSizeLimit
    
    memoryUsage.value = `${Math.round(used / 1024 / 1024)} MB`
    
    // 内存使用率警告
    if (used / limit > 0.8) {
      console.warn('内存使用率过高:', Math.round((used / limit) * 100) + '%')
    }
  }
}

const updateDOMStats = () => {
  domNodes.value = document.querySelectorAll('*').length
  
  // 估算事件监听器数量（无法直接获取）
  const elements = document.querySelectorAll('*')
  let listenerCount = 0
  elements.forEach(el => {
    // 这是一个估算，实际数量可能不同
    if (el.onclick || el.onload || el.onchange) {
      listenerCount++
    }
  })
  eventListeners.value = listenerCount
}

const clearCache = () => {
  // 清除图片缓存
  if (window.clearImageCache) {
    window.clearImageCache()
  }
  
  // 清除localStorage缓存
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.includes('cache') || key.includes('image')) {
      localStorage.removeItem(key)
    }
  })
  
  ElMessage.success('缓存已清除')
}

const forceGC = () => {
  // 强制垃圾回收（如果可用）
  if (window.gc) {
    window.gc()
    ElMessage.success('垃圾回收已执行')
  } else {
    ElMessage.warning('垃圾回收不可用')
  }
}

const exportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    postCount: props.postCount,
    imageCount: props.imageCount,
    fps: fps.value,
    memoryUsage: memoryUsage.value,
    firstScreenTime: firstScreenTime.value,
    imageLoadTime: imageLoadTime.value,
    totalLoadTime: totalLoadTime.value,
    domNodes: domNodes.value,
    eventListeners: eventListeners.value,
    cacheHitRate: cacheHitRate.value,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('性能报告已导出')
}

// 生命周期
onMounted(() => {
  if (!isDevelopment.value) return
  
  // 开始FPS监控
  updateFPS()
  
  // 开始内存监控
  memoryInterval = setInterval(updateMemory, 1000)
  
  // 开始DOM统计
  setInterval(updateDOMStats, 2000)
  
  // 记录首屏加载时间
  window.addEventListener('load', () => {
    firstScreenTime.value = Math.round(performance.now())
  })
  
  // 记录图片加载时间
  const images = document.querySelectorAll('img')
  let loadedImages = 0
  const totalImages = images.length
  
  images.forEach(img => {
    img.addEventListener('load', () => {
      loadedImages++
      if (loadedImages === totalImages) {
        imageLoadTime.value = Math.round(performance.now())
      }
    })
  })
  
  // 计算总加载时间
  totalLoadTime.value = Math.round(performance.now())
})

onUnmounted(() => {
  if (fpsInterval) {
    clearInterval(fpsInterval)
  }
  if (memoryInterval) {
    clearInterval(memoryInterval)
  }
})
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  padding: 16px;
  z-index: 9999;
  font-size: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.monitor-header h3 {
  margin: 0;
  font-size: 14px;
  color: #409eff;
}

.monitor-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.monitor-section {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px;
  border-radius: 4px;
}

.monitor-section h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #67c23a;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 11px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.fps-warning {
  color: #f56c6c;
  font-weight: bold;
}

.monitor-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.monitor-actions .el-button {
  font-size: 10px;
  padding: 4px 8px;
  height: auto;
}

.monitor-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.monitor-toggle:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .performance-monitor {
    width: 280px;
    right: 10px;
    top: 10px;
  }
  
  .monitor-toggle {
    right: 10px;
    top: 10px;
    width: 36px;
    height: 36px;
  }
}
</style>

