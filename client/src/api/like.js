import request from './request'

export function likePost(postId) {
  return request.post(`/likes/${postId}`)
}

export function getLikeCount(postId) {
  return request.get(`/likes/${postId}`)
}

export function getUserLikeHistory() {
  return request.get('/likes/user/history')
} 