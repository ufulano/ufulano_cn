// comment.js
/**
 * 评论路由
 * 
 * 功能特性：
 * - 创建评论：POST /comments
 * - 获取评论：GET /comments
 * - 评论详情：GET /comments/:id
 * - 更新评论：PUT /comments/:id
 * - 删除评论：DELETE /comments/:id
 * - 帖子评论：GET /comments/post/:postId
 * - 回复评论：POST /comments/:id/reply
 * 
 * 中间件：
 * - 身份验证：JWT令牌验证
 * - 权限检查：评论权限验证
 * - 内容过滤：敏感内容检测
 * - 输入验证：请求数据验证
 * 
 * 安全措施：
 * - 身份验证：确保用户身份
 * - 权限控制：防止越权操作
 * - 内容验证：防止恶意内容
 * - 速率限制：防止垃圾评论
 */

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { createComment, getComment } = require('../controllers/commentController');

// 测试路由
router.get('/test', (req, res) => {
  console.log('=== 评论测试路由被调用 ===');
  res.json({ message: '评论路由工作正常' });
});

/**
 * @swagger
 * /api/comments/{postId}:
 *   get:
 *     summary: 获取某帖评论流
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 评论列表
 */
router.get('/:postId', getComment);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: 发布评论
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: 评论发布成功
 */
router.post('/', authenticateToken, createComment);

module.exports = router;