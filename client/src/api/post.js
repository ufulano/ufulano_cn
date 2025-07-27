import request from './request'

// 获取所有帖子
export function fetchPosts(params) {
  console.log('=== fetchPosts API 调用 ===')
  console.log('请求参数:', params)
  console.log('请求URL:', '/getAllPosts')
  console.log('完整URL:', '/api/getAllPosts')
  
  return request.get('/getAllPosts', { params })
    .then(response => {
      console.log('fetchPosts 成功响应:', response)
      return response
    })
    .catch(error => {
      console.error('fetchPosts 请求失败:', error)
      console.error('错误详情:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      })
      throw error
    })
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
  return request.get(`/user/${userId}/posts`)
}

// 获取热门帖子
export function getHotPosts() {
  return request.get('/hotPosts')
}

// 获取推荐帖子
export function getRecommendedPosts() {
  return request.get('/recommendedPosts')
} 