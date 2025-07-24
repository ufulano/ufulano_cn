const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('winston');
const fs = require('fs');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const commentRoutes = require('./routes/comment');
const likeRoutes = require('./routes/like');
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
// 使用用户认证路由
app.use('/api', authRoutes);

// 使用帖子操作路由
app.use('/api', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);

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

// 同步数据库表结构
sequelize.sync()
  .then(async () => {
    console.log('数据库表结构同步成功');
    // 自动插入测试用户，仅开发环境
    if (process.env.NODE_ENV !== 'production') {
      const exists = await User.findOne({ where: { username: 'testuser' } });
      if (!exists) {
        await User.create({
          username: 'testuser',
          password: bcrypt.hashSync('test123', 10),
          email: 'test@example.com'
        });
        console.log('测试用户 testuser 已创建，密码 test123');
      }
    }
  })
  .catch(err => {
    console.error('数据库表结构同步失败:', err);
  });

setupSwagger(app);

// 7. 启动服务器
app.listen(PORT, () => {
  console.info(`服务器已启动，监听端口 ${PORT}`);
  logger.info(`服务器已启动，监听端口 ${PORT}`);
});
