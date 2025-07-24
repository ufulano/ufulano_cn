import request from './request'

export function fetchComments(postId) {
  return request.get(`/comments/${postId}`)
}

export function addComment(data) {
  return request.post('/comments', data)
} 