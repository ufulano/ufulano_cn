// post.js
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
router.get('/getAllPosts', getAllPosts);

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
router.post('/createPost', authenticateToken, createPost);

module.exports = router;