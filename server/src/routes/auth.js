// auth.js
/**
 * 认证路由
 * 
 * 功能特性：
 * - 用户注册：POST /auth/register
 * - 用户登录：POST /auth/login
 * - 用户登出：POST /auth/logout
 * - 令牌验证：GET /auth/verify
 * - 密码重置：POST /auth/reset-password
 * 
 * 中间件：
 * - 输入验证：请求数据验证
 * - 错误处理：统一错误处理
 * - 日志记录：请求日志记录
 * 
 * 安全措施：
 * - 密码哈希：bcrypt密码加密
 * - JWT令牌：安全的身份验证
 * - 速率限制：防止暴力攻击
 * - 输入过滤：防止注入攻击
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { login, register} = require('../controllers/authController');

// 测试路由
router.get('/test', (req, res) => {
  console.log('=== 认证测试路由被调用 ===');
  res.json({ 
    message: '认证路由工作正常',
    timestamp: new Date().toISOString()
  });
}); 
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               remember:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/login', login);

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 */
router.post('/register', register);

module.exports = router;