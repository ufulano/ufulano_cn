import request from './request'

// 点赞帖子
export function likePost(postId) {
  return request.post('/likePost', { postId })
}

// 取消点赞
export function unlikePost(postId) {
  return request.post('/unlikePost', { postId })
}

// 获取用户点赞状态
export function getLikeStatus(postId) {
  return request.get(`/likeStatus/${postId}`)
}

// 获取帖子点赞数
export function getLikeCount(postId) {
  return request.get(`/likeCount/${postId}`)
}

export function getUserLikeHistory() {
  return request.get('/likes/user/history')
} 