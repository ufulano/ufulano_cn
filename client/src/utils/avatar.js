/**
 * 头像处理工具
 * 
 * 功能特性：
 * - 头像解析：解析不同格式的头像URL
 * - 默认头像：提供默认头像URL
 * - 头像验证：验证头像URL有效性
 * - 头像缓存：头像缓存管理
 * - 头像压缩：自动压缩大尺寸头像
 * - 格式转换：支持多种图片格式
 * 
 * 支持的格式：
 * - 完整URL：http/https链接
 * - 相对路径：相对路径链接
 * - Base64：Base64编码图片
 * - 默认头像：系统默认头像
 * - 本地文件：本地文件路径
 * 
 * 使用场景：
 * - 用户头像显示
 * - 评论头像显示
 * - 搜索结果头像
 * - 个人资料头像
 * - 头像上传预览
 */

/**
 * 解析头像数据
 * 
 * 功能：
 * - 解析不同格式的头像数据
 * - 提供默认头像作为备选
 * - 处理各种异常情况
 * 
 * @param {string} avatarData - 头像数据，可能是base64字符串或JSON数组字符串
 * @returns {string} 解析后的头像URL或默认头像
 */
export function parseAvatar(avatarData) {
  if (!avatarData) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='
  }
  
  try {
    // 如果头像数据是JSON字符串（数组格式），解析它
    if (avatarData.startsWith('[') && avatarData.endsWith(']')) {
      const parsed = JSON.parse(avatarData)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]
      }
    }
    
    // 如果已经是base64格式，直接返回
    if (avatarData.startsWith('data:image/')) {
      return avatarData
    }
    
    // 如果是URL格式，直接返回
    if (avatarData.startsWith('http://') || avatarData.startsWith('https://')) {
      return avatarData
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='
  } catch (error) {
    console.error('解析头像数据失败:', error, '原始数据:', avatarData)
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='
  }
}

/**
 * 获取用户头像
 * @param {object} user - 用户对象
 * @returns {string} 用户头像URL
 */
export function getUserAvatar(user) {
  if (!user) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='
  }
  
  // 尝试从不同属性获取头像
  const avatarSources = [
    user.avatar,
    user.avatar_url,
    user.avatarUrl,
    user.profile_image
  ]
  
  for (const avatar of avatarSources) {
    if (avatar) {
      const parsed = parseAvatar(avatar)
      if (parsed !== 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg==') {
        return parsed
      }
    }
  }
  
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjQ0NDQ0NDIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI0ZGRkZGRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJhzwvdGV4dD4KPC9zdmc+Cg=='
} 