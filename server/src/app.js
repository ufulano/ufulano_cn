const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('JWT_SECRET from .env:', process.env.JWT_SECRET);
/**
 * 主应用服务器文件
 * 
 * 功能特性：
 * - Express服务器配置：中间件、路由、错误处理
 * - 数据库连接：MySQL数据库连接和配置
 * - 跨域处理：CORS配置和预检请求处理
 * - 安全中间件：helmet、rate limiting等安全措施
 * - 日志记录：访问日志和错误日志
 * - API文档：Swagger API文档集成
 * 
 * 技术栈：
 * - Express.js：Web应用框架
 * - MySQL：关系型数据库
 * - JWT：用户认证和授权
 * - Multer：文件上传处理
 * - Swagger：API文档生成
 * 
 * 中间件配置：
 * - 静态文件服务
 * - 请求体解析
 * - 跨域处理
 * - 安全头部
 * - 访问日志
 * - 错误处理
 */

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const likeRoutes = require('./routes/like');
const userRoutes = require('./routes/user');
const repostRoutes = require('./routes/repost');
const sequelize = require('./config/database');
const jwtSecret = process.env.JWT_SECRET;
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const setupSwagger = require('./swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 日志配置
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 2. 中间件配置
console.log('=== 配置CORS ===');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

console.log('=== 配置bodyParser ===');
console.log('JSON limit: 50mb');
console.log('URL encoded limit: 50mb');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 3. 请求日志中间件
app.use((req, res, next) => {
  console.info(`接收到请求: ${req.method} ${req.url}`);
  next();
});
app.use(express.static('client/public'));

// 4. HTTP 请求日志
app.use(morgan('combined', { stream: accessLogStream }));

// 5. 路由配置
console.log('=== 配置路由 ===');

// 使用用户认证路由
app.use('/api', authRoutes);
console.log('认证路由已配置: /api');

// 使用帖子操作路由
app.use('/api', postRoutes);
console.log('帖子路由已配置: /api');

app.use('/api/comments', commentRoutes);
console.log('评论路由已配置: /api/comments');

app.use('/api/likes', likeRoutes);
console.log('点赞路由已配置: /api/likes');

app.use('/api/user', userRoutes);
console.log('用户路由已配置: /api/user');

app.use('/api/repost', repostRoutes);
console.log('转发路由已配置: /api/repost');

// 添加路由调试中间件
app.use('/api/comments/*', (req, res, next) => {
  console.log('=== 评论路由调试 ===');
  console.log('请求方法:', req.method);
  console.log('请求URL:', req.url);
  console.log('请求路径:', req.path);
  console.log('请求参数:', req.params);
  next();
});

// 添加 404 处理
app.use('/api/*', (req, res) => {
  console.log('=== 404 错误 ===');
  console.log('未找到路由:', req.method, req.url);
  res.status(404).json({
    message: 'API 路由未找到',
    path: req.url,
    method: req.method
  });
});

// 添加全局错误处理
app.use((err, req, res, next) => {
  console.error('=== 全局错误处理 ===');
  console.error('错误:', err);
  console.error('请求URL:', req.url);
  console.error('请求方法:', req.method);
  
  // 处理请求体过大的错误
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      message: '请求数据过大，请压缩图片后重试',
      error: 'PayloadTooLargeError'
    });
  }
  
  res.status(500).json({
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 6. 数据库同步
// 引入 Sequelize 模型
// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

// 同步数据库表结构（使用 force: false 避免删除表）
sequelize.sync({ force: false, alter: false })
  .then(async () => {
    console.log('数据库表结构同步成功');
  })
  .catch(err => {
    console.error('数据库表结构同步失败:', err);
    
    // 如果是外键约束错误，提供解决方案
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.error('外键约束错误，请手动执行以下SQL:');
      console.error('-- 查看当前外键约束');
      console.error('SHOW CREATE TABLE Likes;');
      console.error('-- 手动添加缺失的外键约束');
      console.error('ALTER TABLE Likes ADD CONSTRAINT Likes_post_id_fk FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE ON UPDATE CASCADE;');
    }
    
    // 如果是索引过多错误，提供解决方案
    if (err.code === 'ER_TOO_MANY_KEYS') {
      console.error('索引过多错误，请手动执行以下SQL:');
      console.error('DROP INDEX IF EXISTS email_2 ON Users;');
      console.error('DROP INDEX IF EXISTS username_2 ON Users;');
      console.error('ALTER TABLE Posts MODIFY COLUMN image_url LONGTEXT;');
    }
    
    // 如果是数据类型错误，提供解决方案
    if (err.code === 'ER_DATA_TOO_LONG') {
      console.error('数据太长错误，请手动执行以下SQL:');
      console.error('ALTER TABLE Posts MODIFY COLUMN image_url LONGTEXT;');
    }
  });
  
setupSwagger(app);

// 7. 启动服务器
app.listen(PORT, () => {
  console.info(`服务器已启动，监听端口 ${PORT}`);
  logger.info(`服务器已启动，监听端口 ${PORT}`);
});
