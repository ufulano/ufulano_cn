/**
 * 转发路由
 * 
 * 功能特性：
 * - 转发帖子：POST /api/repost
 * - 取消转发：DELETE /api/repost/:repostId
 * - 获取帖子转发列表：GET /api/repost/post/:postId
 * - 获取用户转发历史：GET /api/repost/user/:userId
 * - 检查转发状态：GET /api/repost/status/:postId
 */

const express = require('express');
const router = express.Router();
const repostController = require('../controllers/repostController');
const authMiddleware = require('../middleware/authMiddleware');

// 所有转发相关路由都需要认证
router.use(authMiddleware);

// 转发帖子
router.post('/', repostController.createRepost);

// 取消转发
router.delete('/:repostId', repostController.deleteRepost);

// 获取帖子的转发列表
router.get('/post/:postId', repostController.getRepostsByPost);

// 获取用户的转发历史
router.get('/user/:userId', repostController.getUserReposts);

// 检查用户是否已转发某帖子
router.get('/status/:postId', repostController.checkRepostStatus);

module.exports = router;
