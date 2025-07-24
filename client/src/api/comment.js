import request from './request'

export function fetchComments(postId) {
  return request.get('/comments', { params: { postId } })
}

export function addComment(data) {
  return request.post('/comments', data)
} 