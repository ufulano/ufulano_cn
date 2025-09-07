import request from './request'

// 更新用户头像
export function updateUserAvatar(avatarData) {
  return request.post('/users/avatar', { avatar_url: avatarData })
}

// 更新用户信息
export function updateUserInfo(userData) {
  return request.put('/users/profile', userData)
}

// 获取用户信息
export function getUserInfo(userId) {
  return request.get(`/users/${userId}`)
}

// 获取用户帖子
export function getUserPosts(userId, page = 1, limit = 10) {
  return request.get(`/users/${userId}/posts`, {
    params: { page, limit }
  })
}

// 获取用户点赞的帖子
export function getUserLikes(userId, page = 1, limit = 10) {
  return request.get(`/users/${userId}/likes`, {
    params: { page, limit }
  })
} 