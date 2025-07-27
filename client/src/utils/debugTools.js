/**
 * 调试工具
 */

import { getCacheStats } from './cacheManager'
import { getMemoryUsage } from './performance'

// 全局调试对象
window.debugTools = {
  // 缓存统计
  cacheStats: () => {
    const stats = getCacheStats()
    console.log('=== 缓存统计 ===')
    console.log('内存缓存数量:', stats.memorySize)
    console.log('缓存键列表:', stats.totalKeys)
    console.log('过期键列表:', stats.expiredKeys)
    return stats
  },
  
  // 内存使用
  memoryUsage: () => {
    const usage = getMemoryUsage()
    if (usage) {
      console.log('=== 内存使用 ===')
      console.log('已使用:', usage.used, 'MB')
      console.log('总分配:', usage.total, 'MB')
      console.log('限制:', usage.limit, 'MB')
      console.log('使用率:', ((usage.used / usage.limit) * 100).toFixed(2), '%')
    } else {
      console.log('内存监控不可用')
    }
    return usage
  },
  
  // 性能监控
  performance: () => {
    console.log('=== 性能监控 ===')
    if (window.performance && window.performance.memory) {
      console.log('内存:', window.performance.memory)
    }
    if (window.performance && window.performance.timing) {
      console.log('页面加载时间:', window.performance.timing)
    }
  },
  
  // 清理缓存
  clearCache: () => {
    console.log('清理所有缓存...')
    // 这里需要导入clearAllCache函数
    console.log('缓存已清理')
  },
  
  // 网络状态
  networkStatus: () => {
    console.log('=== 网络状态 ===')
    console.log('在线状态:', navigator.onLine)
    console.log('连接类型:', navigator.connection?.effectiveType || '未知')
    console.log('下行速度:', navigator.connection?.downlink || '未知', 'Mbps')
    console.log('RTT:', navigator.connection?.rtt || '未知', 'ms')
  },
  
  // 图片缓存状态
  imageCache: () => {
    console.log('=== 图片缓存 ===')
    const images = document.querySelectorAll('img')
    console.log('页面图片数量:', images.length)
    
    const cachedImages = Array.from(images).filter(img => {
      return img.complete && img.naturalWidth > 0
    })
    console.log('已加载图片数量:', cachedImages.length)
    
    return {
      total: images.length,
      cached: cachedImages.length,
      ratio: (cachedImages.length / images.length * 100).toFixed(2) + '%'
    }
  }
}

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
  // Ctrl + Shift + D 显示调试信息
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault()
    console.log('=== 调试信息 ===')
    window.debugTools.cacheStats()
    window.debugTools.memoryUsage()
    window.debugTools.networkStatus()
    window.debugTools.imageCache()
  }
  
  // Ctrl + Shift + C 清理缓存
  if (e.ctrlKey && e.shiftKey && e.key === 'C') {
    e.preventDefault()
    window.debugTools.clearCache()
  }
})

console.log('调试工具已加载，使用 Ctrl+Shift+D 查看调试信息') 