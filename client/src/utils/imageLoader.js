/**
 * 高性能图片加载工具
 */

// 图片缓存
const imageCache = new Map()
const loadingImages = new Set()
const failedImages = new Set()

/**
 * 高性能懒加载图片
 * @param {string} src - 图片URL
 * @param {Function} callback - 加载完成回调
 * @param {Object} options - 配置选项
 */
export function lazyLoadImage(src, callback, options = {}) {
  if (!src) return
  
  // 检查缓存
  if (imageCache.has(src)) {
    callback(imageCache.get(src))
    return
  }
  
  // 检查失败记录
  if (failedImages.has(src)) {
    console.warn('跳过已知失败的图片:', src)
    return
  }
  
  // 检查是否正在加载
  if (loadingImages.has(src)) {
    // 等待加载完成
    const checkInterval = setInterval(() => {
      if (imageCache.has(src)) {
        clearInterval(checkInterval)
        callback(imageCache.get(src))
      }
    }, 50) // 更快的检查间隔
    return
  }
  
  loadingImages.add(src)
  
  const img = new Image()
  
  // 设置加载超时
  const timeout = options.timeout || 10000
  const timeoutId = setTimeout(() => {
    loadingImages.delete(src)
    failedImages.add(src)
    console.error('图片加载超时:', src)
  }, timeout)
  
  img.onload = () => {
    clearTimeout(timeoutId)
    imageCache.set(src, img)
    loadingImages.delete(src)
    callback(img)
  }
  
  img.onerror = () => {
    clearTimeout(timeoutId)
    loadingImages.delete(src)
    failedImages.add(src)
    console.error('图片加载失败:', src)
  }
  
  // 设置图片属性以优化加载
  img.crossOrigin = 'anonymous'
  img.decoding = 'async'
  img.loading = 'lazy'
  
  img.src = src
}

/**
 * 批量预加载图片（高性能）
 * @param {Array} urls - 图片URL数组
 * @param {Object} options - 配置选项
 */
export function preloadImages(urls, options = {}) {
  if (!Array.isArray(urls)) return
  
  const maxConcurrent = options.maxConcurrent || 3
  const priority = options.priority || 'normal'
  
  // 过滤有效的URL
  const validUrls = urls.filter(url => 
    url && 
    !imageCache.has(url) && 
    !loadingImages.has(url) && 
    !failedImages.has(url)
  )
  
  if (validUrls.length === 0) return
  
  // 限制并发数量
  const urlsToLoad = validUrls.slice(0, maxConcurrent)
  
  urlsToLoad.forEach(url => {
    lazyLoadImage(url, () => {}, {
      timeout: options.timeout || 5000,
      ...options
    })
  })
}

/**
 * 智能清理缓存
 * @param {number} maxSize - 最大缓存数量
 */
export function clearImageCache(maxSize = 50) {
  if (imageCache.size > maxSize) {
    const entries = Array.from(imageCache.entries())
    // 保留最近使用的图片
    const toDelete = entries.slice(0, entries.length - maxSize)
    toDelete.forEach(([key]) => {
      imageCache.delete(key)
      // 清理失败记录
      failedImages.delete(key)
    })
  }
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return {
    cached: imageCache.size,
    loading: loadingImages.size,
    failed: failedImages.size
  }
}

/**
 * 清理失败记录
 */
export function clearFailedImages() {
  failedImages.clear()
}

/**
 * 预加载关键图片（高优先级）
 * @param {Array} urls - 图片URL数组
 */
export function preloadCriticalImages(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return
  
  console.log('预加载关键图片:', urls.length, '张')
  
  // 过滤有效的URL
  const validUrls = urls.filter(url => 
    url && 
    !imageCache.has(url) && 
    !loadingImages.has(url) && 
    !failedImages.has(url)
  )
  
  if (validUrls.length === 0) {
    console.log('所有图片已在缓存中或正在加载')
    return
  }
  
  // 高优先级预加载，使用更多并发
  validUrls.forEach(url => {
    lazyLoadImage(url, (img) => {
      console.log('关键图片加载完成:', url)
    }, {
      timeout: 3000
    })
  })
} 