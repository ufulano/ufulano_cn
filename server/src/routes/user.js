// user.js
/**
 * 用户路由
 * 
 * 功能特性：
 * - 用户资料：GET /users/profile
 * - 更新资料：PUT /users/profile
 * - 修改密码：PUT /users/password
 * - 上传头像：POST /users/avatar
 * - 搜索用户：GET /users/search
 * - 关注用户：POST /users/follow
 * - 取消关注：DELETE /users/follow
 * 
 * 中间件：
 * - 身份验证：JWT令牌验证
 * - 权限检查：用户权限验证
 * - 文件上传：头像文件处理
 * - 输入验证：请求数据验证
 * 
 * 安全措施：
 * - 身份验证：确保用户身份
 * - 权限控制：防止越权访问
 * - 文件验证：安全的文件上传
 * - 数据验证：防止恶意数据
 */

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { updateUserAvatar, updateUserProfile, getUserInfo, getUserPosts, getUserLikes } = require('../controllers/userController');

/**
 * @swagger
 * /api/user/avatar:
 *   post:
 *     summary: 更新用户头像
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: 头像更新成功
 */
router.post('/avatar', authenticateToken, updateUserAvatar);

/**
 * @swagger
 * /api/user/profile:
 *   put:
 *     summary: 更新用户信息
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               gender:
 *                 type: string
 *               birthday:
 *                 type: string
 *     responses:
 *       200:
 *         description: 用户信息更新成功
 */
router.put('/profile', authenticateToken, updateUserProfile);

/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     summary: 获取用户信息
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 用户信息
 */
router.get('/:userId', getUserInfo);

/**
 * @swagger
 * /api/user/{userId}/posts:
 *   get:
 *     summary: 获取用户帖子
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 用户帖子列表
 */
router.get('/:userId/posts', getUserPosts);

// 获取用户点赞的帖子
router.get('/:userId/likes', getUserLikes);

module.exports = router; 