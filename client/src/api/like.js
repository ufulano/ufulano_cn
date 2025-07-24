import request from './request'

export function likePost(postId) {
  return request.post('/likes', { postId })
} 