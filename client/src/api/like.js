import request from './request'

/**
 * 点赞/取消点赞帖子
 * @param {number} postId - 帖子ID
 * @returns {Promise} API响应
 */
export const toggleLike = (postId) => {
  return request({
    url: `/likes/${postId}`,
    method: 'POST'
  })
}

/**
 * 获取帖子点赞数
 * @param {number} postId - 帖子ID
 * @returns {Promise} API响应
 */
export const getLikeCount = (postId) => {
  return request({
    url: `/likes/${postId}`,
    method: 'GET'
  })
}

/**
 * 检查用户点赞状态
 * @param {number} postId - 帖子ID
 * @returns {Promise} API响应
 */
export const getLikeStatus = (postId) => {
  return request({
    url: `/likes/${postId}/status`,
    method: 'GET'
  })
}

/**
 * 获取用户点赞历史
 * @returns {Promise} API响应
 */
export const getUserLikeHistory = () => {
  return request({
    url: '/likes/user/history',
    method: 'GET'
  })
}

/**
 * 批量获取点赞数
 * @param {Array} postIds - 帖子ID数组
 * @returns {Promise} API响应
 */
export const getBatchLikeCounts = (postIds) => {
  return request({
    url: '/likes/batch-counts',
    method: 'POST',
    data: { postIds }
  })
}

/**
 * 获取热门帖子
 * @param {number} limit - 限制数量
 * @returns {Promise} API响应
 */
export const getTopLikedPosts = (limit = 10) => {
  return request({
    url: `/likes/top/${limit}`,
    method: 'GET'
  })
}