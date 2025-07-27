const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.login = async (req, res) => {
  console.info('登录请求已到达 authController.js');
  const { username, password, remember } = req.body;
  console.info(req.body);
  try {
    console.info('尝试验证登录信息');
    const user = await User.findOne({ where: { username } });
    if (!user) {
      console.info('用户名或密码错误');
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.info('用户名或密码错误');
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT 密钥未正确设置' });
    }

    const expiresIn = remember ? '7d' : '1h';
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn });
    
    // 构建用户数据，移除敏感信息
    const userData = {
      user_id: user.user_id,
      username: user.username,
      nickname: user.nickname || user.username,
      email: user.email,
      avatar_url: user.avatar_url || ''
    };

    console.log('=== 登录成功 ===');
    console.log('用户ID:', user.user_id);
    console.log('用户名:', user.username);
    console.log('构建的用户数据:', userData);
    console.log('生成的token:', token ? '存在' : '不存在');
    console.log('返回的完整响应:', { token, user: userData });
    
    const response = {
        token,
        user: userData
    };
    
    console.log('发送响应:', response);
    res.json(response);
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

exports.register = async (req, res) => {
  console.info('注册请求已到达 authController.js');
  const { username, email, password } = req.body;
  
  try {
    console.info('尝试验证注册信息');  
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已存在' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT 密钥未正确设置' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: newUser.user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        nickname: newUser.nickname || newUser.username,
        email: newUser.email,
        avatar_url: newUser.avatar_url || ''
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    if (error.message.includes('secretOrPrivateKey')) {
      res.status(500).json({
        success: false,
        message: '服务器配置错误：JWT 密钥未正确设置'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '注册失败'
      });
    }
  }
};