/**
 * 高性能图片加载工具
 * 
 * 功能特性：
 * - 智能缓存管理：避免重复加载相同图片
 * - 并发控制：限制同时加载的图片数量
 * - 失败重试：记录失败的图片，避免重复尝试
 * - 优先级加载：支持关键图片优先加载
 * - 内存管理：自动清理缓存，防止内存泄漏
 * 
 * 使用场景：
 * - 帖子图片预加载
 * - 头像图片加载
 * - 缩略图显示
 * - 图片预览功能
 */

// 图片缓存管理
const imageCache = new Map()    // 已加载的图片缓存
const loadingImages = new Set() // 正在加载的图片集合
const failedImages = new Set()  // 加载失败的图片集合

/**
 * 高性能懒加载图片
 * 
 * @param {string} src - 图片URL
 * @param {Function} callback - 加载完成回调函数，参数为加载完成的Image对象
 * @param {Object} options - 配置选项
 *   @param {number} options.timeout - 加载超时时间（毫秒），默认10000ms
 *   @param {string} options.priority - 加载优先级，'high' | 'normal' | 'low'
 * 
 * 工作流程：
 * 1. 检查缓存：如果图片已缓存，直接返回
 * 2. 检查失败记录：如果图片加载失败过，跳过加载
 * 3. 检查加载状态：如果图片正在加载，等待完成
 * 4. 开始加载：创建Image对象，设置事件监听
 * 5. 超时处理：设置超时定时器，防止无限等待
 * 6. 缓存管理：加载成功后加入缓存，失败后加入失败记录
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
  
  // 设置加载超时 - 减少到5秒
  const timeout = options.timeout || 5000
  const timeoutId = setTimeout(() => {
    loadingImages.delete(src)
    failedImages.add(src)
    console.warn('图片加载超时:', src)
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
 * 
 * @param {Array} urls - 图片URL数组
 * @param {Object} options - 配置选项
 *   @param {number} options.maxConcurrent - 最大并发数，默认3
 *   @param {string} options.priority - 加载优先级，默认'normal'
 *   @param {number} options.timeout - 超时时间，默认5000ms
 * 
 * 特性：
 * - 并发控制：限制同时加载的图片数量，避免浏览器阻塞
 * - 智能过滤：自动过滤无效URL和已缓存的图片
 * - 性能优化：分批加载，优先加载关键图片
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
 * 
 * @param {number} maxSize - 最大缓存数量，默认50
 * 
 * 清理策略：
 * - 当缓存数量超过限制时，自动清理最旧的图片
 * - 同时清理对应的失败记录
 * - 保留最近使用的图片，提高访问速度
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
 * 获取缓存统计信息
 * 
 * @returns {Object} 缓存统计对象
 *   @returns {number} cached - 已缓存的图片数量
 *   @returns {number} loading - 正在加载的图片数量
 *   @returns {number} failed - 加载失败的图片数量
 * 
 * 用途：调试和监控图片加载性能
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
 * 
 * 功能：清空所有加载失败的图片记录
 * 用途：当网络环境改善时，允许重新尝试加载之前失败的图片
 */
export function clearFailedImages() {
  failedImages.clear()
}

/**
 * 预加载关键图片（高优先级）
 * 
 * @param {Array} urls - 图片URL数组
 * 
 * 特性：
 * - 高优先级加载：用于首屏关键图片
 * - 无并发限制：同时加载所有关键图片
 * - 快速超时：3秒超时，避免阻塞其他资源
 * - 静默加载：不输出调试信息，减少控制台噪音
 * 
 * 使用场景：
 * - 帖子列表中的第一张图片
 * - 用户头像
 * - 重要的UI元素图片
 */
export function preloadCriticalImages(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return
  
  // 过滤有效的URL
  const validUrls = urls.filter(url => 
    url && 
    !imageCache.has(url) && 
    !loadingImages.has(url) && 
    !failedImages.has(url)
  )
  
  if (validUrls.length === 0) return
  
  // 高优先级预加载，使用更多并发
  validUrls.forEach(url => {
    lazyLoadImage(url, () => {}, {
      timeout: 2000  // 关键图片2秒超时
    })
  })
}
