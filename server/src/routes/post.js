// post.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { login, register} = require('../controllers/authController'); 
const authenticateToken = require('../middleware/authMiddleware');
const { createPost, getAllPosts } = require('../controllers/postController');

router.post('/createPost', authenticateToken, createPost);
router.get('/getAllPosts', getAllPosts);

module.exports = router;