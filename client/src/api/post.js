import request from './request'

// 获取所有帖子
export function fetchPosts(params) {
  return request.get('/getAllPosts', { params })
}

// 获取单个帖子详情
export function fetchPost(id) {
  return request.get(`/posts/${id}`)
}

// 创建新帖子
export function createPost(data) {
  return request.post('/createPost', data)
}

// 删除帖子
export function deletePost(postId) {
  return request.delete(`/posts/${postId}`)
}

// 更新帖子
export function updatePost(postId, data) {
  return request.put(`/posts/${postId}`, data)
}

// 搜索帖子
export function searchPosts(keyword) {
  return request.get('/searchPosts', { params: { keyword } })
}

// 获取用户帖子
export function getUserPosts(userId) {
  return request.get(`/userPosts/${userId}`)
}

// 获取热门帖子
export function getHotPosts() {
  return request.get('/hotPosts')
}

// 获取推荐帖子
export function getRecommendedPosts() {
  return request.get('/recommendedPosts')
} 