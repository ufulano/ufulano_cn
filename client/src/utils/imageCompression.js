/**
 * 智能压缩图片
 * @param {string} base64String - 原始base64图片数据
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxSizeKB - 最大文件大小(KB)
 * @returns {Promise<string>} 压缩后的base64图片数据
 */
export function compressImage(base64String, maxWidth = 800, maxSizeKB = 500) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 计算新的尺寸
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 动态调整质量以达到目标文件大小
        const compressWithQuality = (quality) => {
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          const sizeKB = (compressedBase64.length * 3) / 4 / 1024
          
          console.log(`压缩质量: ${quality.toFixed(1)}, 文件大小: ${sizeKB.toFixed(2)}KB`)
          
          if (sizeKB <= maxSizeKB || quality <= 0.1) {
            return compressedBase64
          } else {
            return compressWithQuality(quality - 0.1)
          }
        }
        
        const result = compressWithQuality(0.9)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = (error) => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = base64String
  })
}

/**
 * 检查图片大小
 * @param {string} base64String - base64图片数据
 * @returns {number} 图片大小(KB)
 */
export function getImageSize(base64String) {
  return (base64String.length * 3) / 4 / 1024
}

/**
 * 验证图片格式
 * @param {File} file - 文件对象
 * @returns {boolean} 是否为有效图片
 */
export function isValidImage(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  return allowedTypes.includes(file.type)
}

/**
 * 验证图片大小
 * @param {File} file - 文件对象
 * @param {number} maxSizeMB - 最大大小(MB)
 * @returns {boolean} 是否在限制范围内
 */
export function isValidImageSize(file, maxSizeMB = 10) {
  return file.size <= maxSizeMB * 1024 * 1024
} 