import request from './request'

// 获取评论
export function fetchComments(postId) {
  return request.get(`/comments/${postId}`)
}
// 添加评论
export function addComment(data) {
  return request.post('/comments', data)
} 