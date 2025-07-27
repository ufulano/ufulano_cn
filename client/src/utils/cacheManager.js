/**
 * 缓存管理器
 */

// 内存缓存
const memoryCache = new Map()
const cacheExpiry = new Map()

// 缓存配置
const CACHE_CONFIG = {
  // API缓存时间（毫秒）
  API_CACHE_TIME: 5 * 60 * 1000, // 5分钟
  // 图片缓存时间（毫秒）
  IMAGE_CACHE_TIME: 30 * 60 * 1000, // 30分钟
  // 用户数据缓存时间（毫秒）
  USER_CACHE_TIME: 10 * 60 * 1000, // 10分钟
  // 最大缓存数量
  MAX_CACHE_SIZE: 100
}

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 * @param {number} ttl - 过期时间（毫秒）
 */
export function setCache(key, value, ttl = CACHE_CONFIG.API_CACHE_TIME) {
  // 清理过期缓存
  cleanupExpiredCache()
  
  // 检查缓存大小
  if (memoryCache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
    const oldestKey = memoryCache.keys().next().value
    memoryCache.delete(oldestKey)
    cacheExpiry.delete(oldestKey)
  }
  
  memoryCache.set(key, value)
  cacheExpiry.set(key, Date.now() + ttl)
  
  // 同时存储到localStorage
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      value,
      expiry: Date.now() + ttl
    }))
  } catch (error) {
    console.warn('localStorage缓存失败:', error)
  }
}

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any} 缓存值或null
 */
export function getCache(key) {
  // 检查内存缓存
  if (memoryCache.has(key)) {
    const expiry = cacheExpiry.get(key)
    if (expiry && Date.now() < expiry) {
      return memoryCache.get(key)
    } else {
      // 过期，删除
      memoryCache.delete(key)
      cacheExpiry.delete(key)
    }
  }
  
  // 检查localStorage缓存
  try {
    const cached = localStorage.getItem(`cache_${key}`)
    if (cached) {
      const { value, expiry } = JSON.parse(cached)
      if (Date.now() < expiry) {
        // 恢复到内存缓存
        memoryCache.set(key, value)
        cacheExpiry.set(key, expiry)
        return value
      } else {
        // 过期，删除
        localStorage.removeItem(`cache_${key}`)
      }
    }
  } catch (error) {
    console.warn('localStorage读取失败:', error)
  }
  
  return null
}

/**
 * 删除缓存
 * @param {string} key - 缓存键
 */
export function deleteCache(key) {
  memoryCache.delete(key)
  cacheExpiry.delete(key)
  try {
    localStorage.removeItem(`cache_${key}`)
  } catch (error) {
    console.warn('localStorage删除失败:', error)
  }
}

/**
 * 清理过期缓存
 */
export function cleanupExpiredCache() {
  const now = Date.now()
  for (const [key, expiry] of cacheExpiry.entries()) {
    if (now >= expiry) {
      memoryCache.delete(key)
      cacheExpiry.delete(key)
      try {
        localStorage.removeItem(`cache_${key}`)
      } catch (error) {
        console.warn('localStorage清理失败:', error)
      }
    }
  }
}

/**
 * 清空所有缓存
 */
export function clearAllCache() {
  memoryCache.clear()
  cacheExpiry.clear()
  
  // 清理localStorage中的缓存
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('localStorage清空失败:', error)
  }
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return {
    memorySize: memoryCache.size,
    totalKeys: Array.from(memoryCache.keys()),
    expiredKeys: Array.from(cacheExpiry.entries())
      .filter(([_, expiry]) => Date.now() >= expiry)
      .map(([key, _]) => key)
  }
}

// 定期清理过期缓存
setInterval(cleanupExpiredCache, 60000) // 每分钟清理一次 