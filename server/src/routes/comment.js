// comment.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { createComment, getComment } = require('../controllers/commentController');

// 创建评论（需要认证）
router.post('/', authenticateToken, createComment);

// 根据文章ID获取评论
router.get('/:postId', getComment);

module.exports = router;