/**
 * 转发相关API
 * 
 * 功能特性：
 * - 转发帖子：创建转发记录
 * - 取消转发：删除转发记录
 * - 获取转发列表：获取帖子的转发列表
 * - 获取用户转发：获取用户的转发历史
 * - 检查转发状态：检查用户是否已转发某帖子
 */

import request from './request'

/**
 * 转发帖子
 * @param {Object} data - 转发数据
 * @param {number} data.originalPostId - 原帖ID
 * @param {string} data.repostContent - 转发时添加的内容
 * @returns {Promise} API响应
 */
export const createRepost = (data) => {
  return request({
    url: '/repost',
    method: 'POST',
    data
  })
}

/**
 * 取消转发
 * @param {number} repostId - 转发记录ID
 * @returns {Promise} API响应
 */
export const deleteRepost = (repostId) => {
  return request({
    url: `/repost/${repostId}`,
    method: 'DELETE'
  })
}

/**
 * 获取帖子的转发列表
 * @param {number} postId - 帖子ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise} API响应
 */
export const getRepostsByPost = (postId, params = {}) => {
  return request({
    url: `/repost/post/${postId}`,
    method: 'GET',
    params
  })
}

/**
 * 获取用户的转发历史
 * @param {number} userId - 用户ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise} API响应
 */
export const getUserReposts = (userId, params = {}) => {
  return request({
    url: `/repost/user/${userId}`,
    method: 'GET',
    params
  })
}

/**
 * 检查用户是否已转发某帖子
 * @param {number} postId - 帖子ID
 * @returns {Promise} API响应
 */
export const checkRepostStatus = (postId) => {
  return request({
    url: `/repost/status/${postId}`,
    method: 'GET'
  })
}
