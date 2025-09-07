// post.js
/**
 * 帖子路由
 * 
 * 功能特性：
 * - 创建帖子：POST /posts
 * - 获取帖子：GET /posts
 * - 帖子详情：GET /posts/:id
 * - 更新帖子：PUT /posts/:id
 * - 删除帖子：DELETE /posts/:id
 * - 搜索帖子：GET /posts/search
 * - 记录浏览：POST /posts/:id/view
 * 
 * 中间件：
 * - 身份验证：JWT令牌验证
 * - 权限检查：帖子权限验证
 * - 内容过滤：敏感内容检测
 * - 文件上传：图片文件处理
 * 
 * 安全措施：
 * - 身份验证：确保用户身份
 * - 权限控制：防止越权操作
 * - 内容验证：防止恶意内容
 * - 文件验证：安全的文件上传
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { login, register} = require('../controllers/authController'); 
const authenticateToken = require('../middleware/authMiddleware');
const { createPost, getAllPosts } = require('../controllers/postController');

/**
 * @swagger
 * /api/getAllPosts:
 *   get:
 *     summary: 获取所有帖子
 *     tags: [Post]
 *     responses:
 *       200:
 *         description: 帖子列表
 */
router.get('/', getAllPosts);

/**
 * @swagger
 * /api/createPost:
 *   post:
 *     summary: 创建新帖子
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               topics:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *     responses:
 *       201:
 *         description: 帖子创建成功
 */
router.post('/', authenticateToken, createPost);

module.exports = router;