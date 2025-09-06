/**
 * 转发控制器
 * 
 * 功能特性：
 * - 转发帖子：用户转发其他用户的帖子
 * - 取消转发：用户取消之前的转发
 * - 获取转发列表：获取某个帖子的转发列表
 * - 获取用户转发：获取用户的转发历史
 * - 转发统计：统计转发数量
 */

const { Post, User, Repost } = require('../models');
const { Op } = require('sequelize');

/**
 * 转发帖子
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const createRepost = async (req, res) => {
  try {
    const { originalPostId, repostContent } = req.body;
    const userId = req.user.user_id;

    // 验证原帖是否存在
    const originalPost = await Post.findByPk(originalPostId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'username', 'nickname', 'avatar_url']
      }]
    });

    if (!originalPost) {
      return res.status(404).json({
        success: false,
        message: '原帖不存在'
      });
    }

    // 检查是否已经转发过
    const existingRepost = await Repost.findOne({
      where: {
        user_id: userId,
        original_post_id: originalPostId,
        is_deleted: 0
      }
    });

    if (existingRepost) {
      return res.status(400).json({
        success: false,
        message: '您已经转发过这条帖子'
      });
    }

    // 创建转发记录
    const repost = await Repost.create({
      user_id: userId,
      original_post_id: originalPostId,
      repost_content: repostContent || null,
      repost_time: new Date()
    });

    // 创建转发帖子
    const repostPost = await Post.create({
      user_id: userId,
      content: repostContent || null,
      repost_id: originalPostId,
      post_time: new Date(),
      repost_count: 0,
      like_count: 0,
      comment_count: 0,
      visibility: 0
    });

    // 更新原帖的转发数
    await Post.increment('repost_count', {
      where: { post_id: originalPostId }
    });

    // 获取转发后的完整信息
    const repostWithDetails = await Post.findByPk(repostPost.post_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'nickname', 'avatar_url']
        },
        {
          model: Post,
          as: 'originalPost',
          include: [{
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'nickname', 'avatar_url']
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '转发成功',
      data: repostWithDetails
    });

  } catch (error) {
    console.error('转发失败:', error);
    res.status(500).json({
      success: false,
      message: '转发失败',
      error: error.message
    });
  }
};

/**
 * 取消转发
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const deleteRepost = async (req, res) => {
  try {
    const { repostId } = req.params;
    const userId = req.user.user_id;

    // 查找转发记录
    const repost = await Repost.findOne({
      where: {
        repost_id: repostId,
        user_id: userId,
        is_deleted: 0
      }
    });

    if (!repost) {
      return res.status(404).json({
        success: false,
        message: '转发记录不存在'
      });
    }

    // 软删除转发记录
    await repost.update({ is_deleted: 1 });

    // 删除转发帖子
    await Post.destroy({
      where: {
        repost_id: repost.original_post_id,
        user_id: userId
      }
    });

    // 更新原帖的转发数
    await Post.decrement('repost_count', {
      where: { post_id: repost.original_post_id }
    });

    res.json({
      success: true,
      message: '取消转发成功'
    });

  } catch (error) {
    console.error('取消转发失败:', error);
    res.status(500).json({
      success: false,
      message: '取消转发失败',
      error: error.message
    });
  }
};

/**
 * 获取帖子的转发列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getRepostsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const reposts = await Repost.findAndCountAll({
      where: {
        original_post_id: postId,
        is_deleted: 0
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'username', 'nickname', 'avatar_url']
      }],
      order: [['repost_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reposts: reposts.rows,
        total: reposts.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(reposts.count / limit)
      }
    });

  } catch (error) {
    console.error('获取转发列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取转发列表失败',
      error: error.message
    });
  }
};

/**
 * 获取用户的转发历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const getUserReposts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const reposts = await Repost.findAndCountAll({
      where: {
        user_id: userId,
        is_deleted: 0
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'nickname', 'avatar_url']
        },
        {
          model: Post,
          as: 'originalPost',
          include: [{
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'nickname', 'avatar_url']
          }]
        }
      ],
      order: [['repost_time', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        reposts: reposts.rows,
        total: reposts.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(reposts.count / limit)
      }
    });

  } catch (error) {
    console.error('获取用户转发失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户转发失败',
      error: error.message
    });
  }
};

/**
 * 检查用户是否已转发某帖子
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const checkRepostStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id;

    const repost = await Repost.findOne({
      where: {
        user_id: userId,
        original_post_id: postId,
        is_deleted: 0
      }
    });

    res.json({
      success: true,
      data: {
        isReposted: !!repost,
        repostId: repost ? repost.repost_id : null
      }
    });

  } catch (error) {
    console.error('检查转发状态失败:', error);
    res.status(500).json({
      success: false,
      message: '检查转发状态失败',
      error: error.message
    });
  }
};

module.exports = {
  createRepost,
  deleteRepost,
  getRepostsByPost,
  getUserReposts,
  checkRepostStatus
};
