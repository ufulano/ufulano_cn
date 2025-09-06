/**
 * 点赞路由
 * 
 * 功能特性：
 * - 点赞帖子：POST /likes/:postId
 * - 取消点赞：DELETE /likes/:postId
 * - 获取点赞：GET /likes/:postId
 * - 点赞状态：GET /likes/:postId/status
 * - 用户点赞：GET /likes/user/history
 * - 批量点赞：GET /likes/batch
 * 
 * 中间件：
 * - 身份验证：JWT令牌验证
 * - 权限检查：点赞权限验证
 * - 防重复：防止重复点赞
 * - 输入验证：请求数据验证
 * 
 * 安全措施：
 * - 身份验证：确保用户身份
 * - 权限控制：防止越权操作
 * - 防重复：防止重复点赞
 * - 速率限制：防止恶意点赞
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authenticateToken = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/adminMiddleware');
const {
  toggleLike,
  getLikes,
  checkLikeStatus,
  getUserLikeHistory,
  getBatchLikeCounts,
  getTopLikedPosts,
  adminDeleteLike,
  getDailyLikeAnalytics,
} = require('../controllers/likeController');

/**
 * @swagger
 * /api/likes/{postId}:
 *   post:
 *     summary: 点赞/取消点赞
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 点赞或取消成功
 */
router.post(
  '/:postId',
  authenticateToken,
  param('postId').isInt({ min: 1 }), // MySQL ID 是整数
  toggleLike
);

/**
 * @swagger
 * /api/likes/{postId}:
 *   get:
 *     summary: 获取帖子点赞数
 *     tags: [Like]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 点赞数
 */
router.get(
  '/:postId',
  param('postId').isInt({ min: 1 }),
  getLikes
);

/**
 * @swagger
 * /api/likes/{postId}/status:
 *   get:
 *     summary: 检查用户点赞状态
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 点赞状态
 */
router.get(
  '/:postId/status',
  param('postId').isInt({ min: 1 }),
  checkLikeStatus
);

/**
 * @swagger
 * /api/likes/user/history:
 *   get:
 *     summary: 获取当前用户点赞历史
 *     tags: [Like]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 点赞历史
 */
router.get(
  '/user/history',
  authenticateToken,
  getUserLikeHistory
);

// 5. 批量获取点赞数
router.post(
  '/batch-counts',
  body('postIds').isArray({ min: 1 }).custom(arr => arr.every(id => Number.isInteger(id) && id > 0)),
  getBatchLikeCounts
);

// 6. 获取热门文章
router.get(
  '/top/:limit?',
  param('limit').optional().isInt({ min: 1, max: 100 }),
  getTopLikedPosts
);

// 7. 管理员删除点赞（MySQL 版本）
router.delete(
  '/admin/:likeId',
  authenticateToken,
  isAdmin,
  param('likeId').isInt({ min: 1 }),
  adminDeleteLike
);

// 8. 点赞数据分析
router.get(
  '/analytics/daily',
  authenticateToken,
  isAdmin,
  getDailyLikeAnalytics
);

module.exports = router;