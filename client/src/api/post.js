import request from './request'

/**
 * 获取所有帖子
 * @param {Object} params - 查询参数
 * @returns {Promise<Array>} 帖子列表
 */
export function fetchPosts(params) {
  return request.get('/getAllPosts', { params })
}

/**
 * 获取单个帖子详情
 * @param {string|number} id - 帖子ID
 * @returns {Promise<Object>} 帖子详情
 */
export function fetchPost(id) {
  return request.get(`/posts/${id}`)
}

/**
 * 创建新帖子
 * @param {Object} data - 帖子数据
 * @param {string} data.content - 帖子内容
 * @param {Array} data.images - 图片数组
 * @param {Array} data.topics - 话题标签
 * @param {string} data.visibility - 可见性设置
 * @returns {Promise<Object>} 创建结果
 */
export function createPost(data) {
  return request.post('/createPost', data)
}

/**
 * 删除帖子
 * @param {string|number} postId - 帖子ID
 * @returns {Promise<Object>} 删除结果
 */
export function deletePost(postId) {
  return request.delete(`/posts/${postId}`)
}

/**
 * 更新帖子
 * @param {string|number} postId - 帖子ID
 * @param {Object} data - 更新数据
 * @returns {Promise<Object>} 更新结果
 */
export function updatePost(postId, data) {
  return request.put(`/posts/${postId}`, data)
}

/**
 * 搜索帖子
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 搜索结果
 */
export function searchPosts(keyword) {
  return request.get('/searchPosts', { params: { keyword } })
}

/**
 * 获取用户帖子
 * @param {string|number} userId - 用户ID
 * @returns {Promise<Array>} 用户帖子列表
 */
export function getUserPosts(userId) {
  return request.get(`/user/${userId}/posts`)
}

/**
 * 获取热门帖子
 * @returns {Promise<Array>} 热门帖子列表
 */
export function getHotPosts() {
  return request.get('/hotPosts')
}

/**
 * 获取推荐帖子
 * @returns {Promise<Array>} 推荐帖子列表
 */
export function getRecommendedPosts() {
  return request.get('/recommendedPosts')
} 