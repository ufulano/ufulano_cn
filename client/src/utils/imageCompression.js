/**
 * 图片压缩工具
 * 
 * 功能特性：
 * - 图片压缩：自动压缩大尺寸图片
 * - 格式转换：支持多种图片格式
 * - 质量调整：可调节压缩质量
 * - 尺寸调整：自动调整图片尺寸
 * - 批量处理：批量压缩多张图片
 * - 进度回调：压缩进度实时反馈
 * 
 * 支持的格式：
 * - JPEG：有损压缩，适合照片
 * - PNG：无损压缩，适合图标
 * - WebP：现代格式，体积更小
 * - GIF：动画图片格式
 * 
 * 压缩策略：
 * - 质量优先：保持图片质量
 * - 体积优先：最大化压缩比例
 * - 平衡模式：质量和体积平衡
 * - 智能模式：根据图片类型自动选择
 * 
 * 使用场景：
 * - 头像上传压缩
 * - 帖子图片压缩
 * - 批量图片处理
 * - 图片预览生成
 * - 移动端优化
 */

/**
 * 生成正方形缩略图
 * 
 * 功能：
 * - 将大图片压缩为正方形缩略图
 * - 自动裁剪为正方形（取中心区域）
 * - 使用较低质量减少文件大小
 * 
 * @param {string} base64String - 原始base64图片数据
 * @param {number} size - 缩略图尺寸（正方形边长）
 * @returns {Promise<string>} 缩略图base64数据
 */
export function generateThumbnail(base64String, size = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 计算缩略图尺寸 - 强制为正方形
        let { width, height } = img
        let targetSize = size
        
        // 如果图片不是正方形，需要裁剪
        if (width !== height) {
          // 计算裁剪区域（取较小的边作为正方形边长）
          const minSize = Math.min(width, height)
          const offsetX = (width - minSize) / 2
          const offsetY = (height - minSize) / 2
          
          // 设置画布为正方形
          canvas.width = targetSize
          canvas.height = targetSize
          
          // 绘制裁剪后的正方形图片
          ctx.drawImage(
            img, 
            offsetX, offsetY, minSize, minSize,  // 源图片裁剪区域
            0, 0, targetSize, targetSize         // 目标画布区域
          )
        } else {
          // 如果原图就是正方形，直接缩放
          canvas.width = targetSize
          canvas.height = targetSize
          ctx.drawImage(img, 0, 0, targetSize, targetSize)
        }
        
        // 使用较低质量生成缩略图
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
        resolve(thumbnail)
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
 * 生成保持比例的缩略图
 * 
 * 功能：
 * - 将大图片压缩为缩略图
 * - 保持图片原始比例
 * - 使用较低质量减少文件大小
 * 
 * @param {string} base64String - 原始base64图片数据
 * @param {number} maxWidth - 缩略图最大宽度
 * @returns {Promise<string>} 缩略图base64数据
 */
export function generateProportionalThumbnail(base64String, maxWidth = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // 计算缩略图尺寸 - 保持比例
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        
        // 绘制缩略图
        ctx.drawImage(img, 0, 0, width, height)
        
        // 使用较低质量生成缩略图
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
        resolve(thumbnail)
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
 * 智能压缩图片（用于原图）
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
        
        // 计算新的尺寸 - 保持原图比例
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
        
        const result = compressWithQuality(0.8)
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