import request from './request'

export function fetchPosts(params) {
  return request.get('/posts', { params })
}

export function fetchPost(id) {
  return request.get(`/posts/${id}`)
}

export function createPost(data) {
  return request.post('/posts', data)
} 