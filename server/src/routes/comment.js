// comment.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { createComment, getComment } = require('../controllers/commentController');

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