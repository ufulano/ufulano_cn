/**
 * 解析头像数据
 * @param {string} avatarData - 头像数据，可能是base64字符串或JSON数组字符串
 * @returns {string} 解析后的头像URL或默认头像
 */
export function parseAvatar(avatarData) {
  if (!avatarData) {
    return 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像'
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
    
    return 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像'
  } catch (error) {
    console.error('解析头像数据失败:', error, '原始数据:', avatarData)
    return 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像'
  }
}

/**
 * 获取用户头像
 * @param {object} user - 用户对象
 * @returns {string} 用户头像URL
 */
export function getUserAvatar(user) {
  if (!user) {
    return 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像'
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
      if (parsed !== 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像') {
        return parsed
      }
    }
  }
  
  return 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=头像'
} 