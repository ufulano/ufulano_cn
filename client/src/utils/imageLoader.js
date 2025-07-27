/**
 * 图片懒加载和预加载工具
 */

// 图片缓存
const imageCache = new Map()
const loadingImages = new Set()

/**
 * 懒加载图片
 * @param {string} src - 图片URL
 * @param {Function} callback - 加载完成回调
 */
export function lazyLoadImage(src, callback) {
  if (!src) return
  
  // 检查缓存
  if (imageCache.has(src)) {
    callback(imageCache.get(src))
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
    }, 100)
    return
  }
  
  loadingImages.add(src)
  
  const img = new Image()
  img.onload = () => {
    imageCache.set(src, img)
    loadingImages.delete(src)
    callback(img)
  }
  img.onerror = () => {
    loadingImages.delete(src)
    console.error('图片加载失败:', src)
  }
  img.src = src
}

/**
 * 预加载图片
 * @param {Array} urls - 图片URL数组
 */
export function preloadImages(urls) {
  if (!Array.isArray(urls)) return
  
  urls.forEach(url => {
    if (url && !imageCache.has(url) && !loadingImages.has(url)) {
      lazyLoadImage(url, () => {})
    }
  })
}

/**
 * 清理缓存
 * @param {number} maxSize - 最大缓存数量
 */
export function clearImageCache(maxSize = 100) {
  if (imageCache.size > maxSize) {
    const entries = Array.from(imageCache.entries())
    const toDelete = entries.slice(0, entries.length - maxSize)
    toDelete.forEach(([key]) => imageCache.delete(key))
  }
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return {
    cached: imageCache.size,
    loading: loadingImages.size
  }
} 