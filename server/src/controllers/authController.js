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
    // 解构 user 对象，移除 password 属性
    const { userData } = user.get({ plain: true });

        console.log('登录成功');
        res.json({
            token,
            user: userData
        });
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
      { id: newUser.user_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      User: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email
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