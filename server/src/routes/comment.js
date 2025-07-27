// comment.js
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