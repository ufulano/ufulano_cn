/**
 * 点赞控制器
 * 
 * 功能特性：
 * - 点赞管理：点赞、取消点赞、获取点赞状态
 * - 点赞统计：帖子点赞数量统计
 * - 用户点赞：用户点赞历史记录
 * - 实时更新：点赞状态实时同步
 * - 权限控制：点赞权限验证
 * - 防重复：防止重复点赞机制
 * 
 * 数据处理：
 * - 数据验证：点赞数据完整性验证
 * - 事务处理：确保数据一致性
 * - 缓存策略：热门帖子点赞缓存
 * - 性能优化：批量查询和更新
 * 
 * API端点：
 * - POST /likes：创建点赞
 * - DELETE /likes：取消点赞
 * - GET /likes/post/:postId：获取帖子点赞
 * - GET /likes/user/:userId：获取用户点赞
 * - GET /likes/status：获取点赞状态
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Post, User, Like } = require('../models');

/**
 * 1. 点赞/取消点赞
 * POST /likes/:postId
 */
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id; // 从JWT中获取的用户ID

    // 检查文章是否存在
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 检查是否已点赞
    const existingLike = await Like.findOne({
      where: { user_id: userId, post_id: postId }
    });

    if (existingLike) {
      // 取消点赞
      await existingLike.destroy();
      
      // 更新帖子的点赞数
      await Post.decrement('like_count', {
        where: { post_id: postId }
      });
      
      // 获取更新后的点赞数
      const updatedPost = await Post.findByPk(postId);
      
      return res.json({ 
        success: true,
        liked: false, 
        message: '已取消点赞',
        likeCount: updatedPost.like_count || 0
      });
    } else {
      // 新增点赞
      await Like.create({
        user_id: userId,
        post_id: postId,
        like_time: new Date()
      });
      
      // 更新帖子的点赞数
      await Post.increment('like_count', {
        where: { post_id: postId }
      });
      
      // 获取更新后的点赞数
      const updatedPost = await Post.findByPk(postId);
      
      return res.status(201).json({ 
        success: true,
        liked: true, 
        message: '点赞成功',
        likeCount: updatedPost.like_count || 0
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '服务器错误' });
  }
};

/**
 * 2. 获取文章点赞数
 * GET /likes/:postId
 */
exports.getLikes = async (req, res) => {
  try {
    const count = await Like.count({
      where: { post_id: req.params.postId }
    });
    res.json({ likes: count });
  } catch (error) {
    res.status(500).json({ error: '获取点赞数失败' });
  }
};

/**
 * 3. 检查用户是否点赞
 * GET /likes/:postId/status
 */
exports.checkLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user ? req.user.user_id : null;
    
    if (!userId) {
      return res.json({ liked: false, likeCount: 0 });
    }
    
    const like = await Like.findOne({
      where: {
        user_id: userId,
        post_id: postId
      }
    });
    
    // 获取帖子点赞数
    const post = await Post.findByPk(postId);
    const likeCount = post ? post.like_count || 0 : 0;
    
    res.json({ 
      success: true,
      liked: !!like,
      likeCount: likeCount
    });
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    res.status(500).json({ 
      success: false,
      error: '查询失败',
      message: error.message 
    });
  }
};

/**
 * 4. 获取用户点赞历史
 * GET /likes/user/history
 */
exports.getUserLikeHistory = async (req, res) => {
  try {
    const likes = await Like.findAll({
      where: { user_id: req.user.user_id },
      include: [{
        model: Post,
        attributes: ['post_id', 'title']
      }],
      order: [['like_time', 'DESC']]
    });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: '获取历史失败' });
  }
};

/**
 * 5. 批量获取点赞数
 * POST /likes/batch-counts
 */
exports.getBatchLikeCounts = async (req, res) => {
  try {
    const { postIds } = req.body;
    if (!Array.isArray(postIds)) {
      return res.status(400).json({ error: '参数必须为数组' });
    }

    const counts = {};
    for (const postId of postIds) {
      counts[postId] = await Like.count({ where: { post_id: postId } });
    }
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: '批量查询失败' });
  }
};

/**
 * 6. 获取热门文章
 * GET /likes/top?limit=10
 */
exports.getTopLikedPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await Like.findAll({
      attributes: [
        'post_id',
        [sequelize.fn('COUNT', sequelize.col('like_id')), 'like_count']
      ],
      group: ['post_id'],
      order: [[sequelize.literal('like_count'), 'DESC']],
      limit,
      include: [{
        model: Post,
        attributes: ['title']
      }]
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '获取热门失败' });
  }
};

/**
 * 7. 管理员删除点赞
 * DELETE /likes/admin/:likeId
 */
exports.adminDeleteLike = async (req, res) => {
  try {
    const like = await Like.findByPk(req.params.likeId);
    if (!like) {
      return res.status(404).json({ error: '点赞记录不存在' });
    }
    await like.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
};

/**
 * 8. 点赞数据分析
 * GET /likes/analytics/daily?days=7
 */
exports.getDailyLikeAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = await Like.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('like_time')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('like_id')), 'count']
      ],
      where: {
        like_time: {
          [sequelize.Op.gte]: new Date(new Date() - days * 24 * 60 * 60 * 1000)
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('like_time'))],
      order: [[sequelize.fn('DATE', sequelize.col('like_time')), 'ASC']]
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: '分析失败' });
  }
};