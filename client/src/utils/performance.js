/**
 * 性能优化工具函数
 */

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @param {boolean} immediate - 是否立即执行
 */
export function debounce(func, wait, immediate = false) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 批量处理函数
 * @param {Array} items - 要处理的数组
 * @param {Function} processor - 处理函数
 * @param {number} batchSize - 批次大小
 * @param {number} delay - 批次间隔
 */
export function batchProcess(items, processor, batchSize = 10, delay = 16) {
  return new Promise((resolve) => {
    const results = []
    let index = 0
    
    function processBatch() {
      const batch = items.slice(index, index + batchSize)
      
      if (batch.length === 0) {
        resolve(results)
        return
      }
      
      batch.forEach((item, i) => {
        const result = processor(item, index + i)
        results.push(result)
      })
      
      index += batchSize
      
      if (index < items.length) {
        setTimeout(processBatch, delay)
      } else {
        resolve(results)
      }
    }
    
    processBatch()
  })
}

/**
 * 异步队列处理
 */
export class AsyncQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      })
      this.process()
    })
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return
    }
    
    this.running++
    const { task, resolve, reject } = this.queue.shift()
    
    try {
      const result = await task()
      resolve(result)
    } catch (error) {
      reject(error)
    } finally {
      this.running--
      this.process()
    }
  }
}

/**
 * 内存使用监控
 */
export function getMemoryUsage() {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576 * 100) / 100,
      total: Math.round(performance.memory.totalJSHeapSize / 1048576 * 100) / 100,
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576 * 100) / 100
    }
  }
  return null
}

/**
 * 性能监控
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map()
    this.measures = new Map()
  }
  
  mark(name) {
    this.marks.set(name, performance.now())
  }
  
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark) || 0
    const end = this.marks.get(endMark) || performance.now()
    const duration = end - start
    
    this.measures.set(name, duration)
    console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    
    return duration
  }
  
  getMeasures() {
    return Object.fromEntries(this.measures)
  }
} 