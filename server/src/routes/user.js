// user.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { updateUserAvatar, updateUserProfile, getUserInfo, getUserPosts } = require('../controllers/userController');

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

module.exports = router; 