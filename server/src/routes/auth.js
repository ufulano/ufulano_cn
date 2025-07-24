// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { login, register} = require('../controllers/authController'); 
const authenticateToken = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', register);

module.exports = router;