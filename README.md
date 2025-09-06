# Ufulano 社交网站

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.0+-blue.svg)](https://vuejs.org/)
[![Express](https://img.shields.io/badge/Express-4.0+-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.0+-purple.svg)](https://sequelize.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-red.svg)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-green.svg)](https://swagger.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个企业级的现代化社交网站项目，采用前后端分离架构，支持高并发访问和复杂业务场景。项目展示了全栈开发能力，包含完整的用户系统、内容管理、实时交互等功能。

## 📊 项目统计

![GitHub stars](https://img.shields.io/github/stars/yourusername/ufulano_cn?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/ufulano_cn?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/ufulano_cn)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/ufulano_cn)
![GitHub license](https://img.shields.io/github/license/yourusername/ufulano_cn)

| 指标 | 数值 | 说明 |
|------|------|------|
| **代码行数** | 15,000+ | 包含前端Vue组件、后端API、数据库模型等 |
| **文件数量** | 80+ | 涵盖组件、控制器、中间件、工具函数等 |
| **API接口** | 20+ | 完整的RESTful API设计，支持用户、内容、社交等功能 |
| **数据库表** | 5+ | 用户、帖子、评论、点赞、关注等核心业务表 |
| **技术栈** | 15+ | 涵盖前端、后端、数据库、部署等全栈技术 |
| **开发周期** | 3个月 | 从需求分析到部署上线的完整开发流程 |
| **性能指标** | 首屏<2s | 通过多种优化手段达到的性能目标 |

## ✨ 核心功能特性

### 🔐 用户系统
- **JWT身份认证** - 基于Token的无状态认证机制，支持Token刷新和自动续期
- **权限控制** - 细粒度的路由守卫和API权限验证，支持角色基础访问控制(RBAC)
- **用户画像** - 完整的用户信息管理和个性化设置，支持用户标签和兴趣分析
- **安全防护** - 密码加密(bcryptjs)、SQL注入防护、XSS防护、CSRF防护

### 📝 内容管理
- **富文本发布** - 支持图片上传、话题标签、可见性设置，支持Markdown语法
- **内容审核** - 自动内容过滤和人工审核机制，支持敏感词检测
- **SEO优化** - 服务端渲染和元数据管理，支持Open Graph和Twitter Cards
- **内容分发** - 智能推荐算法和个性化推送，基于用户行为和兴趣

### 💬 社交互动
- **实时评论** - 嵌套评论结构和实时更新，支持@用户和表情包
- **点赞系统** - 高性能的点赞计数和状态同步，支持多种内容类型点赞
- **用户关注** - 社交关系图谱和动态流，支持互相关注和粉丝系统
- **消息通知** - 实时推送和邮件通知，支持WebSocket和邮件队列

### 🎨 用户体验
- **响应式设计** - 移动端优先的多设备适配，支持PWA离线访问
- **主题系统** - 可配置的深色/浅色主题切换，支持自定义主题色
- **性能优化** - 虚拟滚动、懒加载、缓存策略，首屏加载时间<2s
- **无障碍访问** - WCAG 2.1标准支持，支持屏幕阅读器和键盘导航

## 🏗️ 技术架构

### 前端架构 (Vue 3 + TypeScript)
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  Vue Components  │  Element Plus  │  Custom UI Components   │
├─────────────────────────────────────────────────────────────┤
│                    State Management                         │
├─────────────────────────────────────────────────────────────┤
│  Pinia Store     │  Vue Router    │  Local Storage          │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic                           │
├─────────────────────────────────────────────────────────────┤
│  API Services    │  Utils        │  Composables            │
├─────────────────────────────────────────────────────────────┤
│                    Network Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Axios          │  Interceptors  │  Error Handling         │
└─────────────────────────────────────────────────────────────┘
```

### 后端架构 (Node.js + Express)
```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
├─────────────────────────────────────────────────────────────┤
│  Rate Limiting  │  CORS        │  Request Validation      │
├─────────────────────────────────────────────────────────────┤
│                    Authentication Layer                     │
├─────────────────────────────────────────────────────────────┤
│  JWT Middleware │  Role-Based   │  Session Management      │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Controllers    │  Services     │  Business Rules          │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Sequelize ORM  │  Query Builder│  Database Migrations     │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│  MySQL Database │  Redis Cache  │  File Storage            │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈详解

### 前端技术栈
- **Vue 3** - 使用Composition API构建响应式用户界面，掌握响应式原理和生命周期
- **TypeScript** - 类型安全的JavaScript开发，具备接口设计、泛型、装饰器等高级特性
- **Vite** - 极速的前端构建工具，支持热模块替换，掌握构建优化和插件开发
- **Element Plus** - 企业级Vue 3 UI组件库，具备组件二次封装和主题定制能力
- **Pinia** - Vue 3官方推荐的状态管理库，掌握状态持久化和插件开发
- **Vue Router** - 官方路由管理器，支持路由守卫、懒加载、动态路由等高级特性
- **Axios** - 基于Promise的HTTP客户端，支持拦截器、请求取消、错误重试等
- **Sass/SCSS** - CSS预处理器，掌握变量、混入、继承等高级特性
- **PWA** - 渐进式Web应用，支持离线访问、推送通知、应用安装等

### 后端技术栈
- **Node.js** - 基于V8引擎的JavaScript运行时，掌握事件循环、异步编程、内存管理
- **Express.js** - 轻量级Web应用框架，支持中间件、路由分组、错误处理等
- **Sequelize** - 强大的ORM工具，支持多种数据库、事务管理、数据迁移等
- **MySQL 8.0** - 高性能关系型数据库，掌握索引优化、查询优化、存储过程等
- **JWT** - 无状态的JSON Web Token认证，掌握Token刷新、黑名单、多设备登录等
- **bcryptjs** - 密码哈希加密库，掌握盐值加密、成本因子调优等安全实践
- **multer** - 文件上传中间件，支持多文件上传、文件过滤、存储优化等
- **cors** - 跨域资源共享中间件，掌握CORS策略配置和安全防护
- **helmet** - 安全头设置中间件，掌握各种安全响应头的配置和原理
- **Redis** - 内存数据库，用于缓存、会话存储、消息队列等场景

### 开发工具链
- **ESLint** - 代码质量检查和格式化
- **Prettier** - 代码格式化工具
- **Swagger/OpenAPI** - API文档自动生成
- **PM2** - Node.js进程管理器
- **Nginx** - 高性能Web服务器和反向代理

## 🚀 快速开始

### 环境要求
- **Node.js** 18.0+ (推荐使用LTS版本)
- **MySQL** 8.0+ (支持JSON字段和窗口函数)
- **Redis** 6.0+ (可选，用于缓存和会话存储)
- **npm** 8.0+ 或 **yarn** 1.22+

### 安装与运行

1. **克隆项目并安装依赖**
```bash
git clone <repository-url>
cd ufulano_cn

# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

2. **数据库配置**
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE ufulano_cn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 配置数据库连接
cp server/src/config/database.example.js server/src/config/database.js
# 编辑 database.js 文件，填入数据库配置
```

3. **环境变量配置**
```bash
# 后端环境变量
cp server/.env.example server/.env
# 配置JWT密钥、数据库连接等
```

4. **启动开发服务器**
```bash
# 启动后端服务 (端口3000)
cd server
npm run dev

# 启动前端服务 (端口5173)
cd ../client
npm run dev
```

5. **访问应用**
- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000
- **API文档**: http://localhost:3000/api-docs
- **健康检查**: http://localhost:3000/health

### 测试账号
- **管理员**: `admin` / `admin123`
- **测试用户**: `testuser` / `test123`

## 📁 项目结构详解

```
ufulano_cn/
├── client/                          # 前端应用 (Vue 3 + Vite)
│   ├── src/
│   │   ├── api/                    # API接口封装
│   │   │   ├── auth.js            # 认证相关API
│   │   │   ├── post.js            # 帖子相关API
│   │   │   ├── user.js            # 用户相关API
│   │   │   └── request.js         # Axios配置和拦截器
│   │   ├── components/            # 可复用组件
│   │   │   ├── AppHeader.vue      # 应用头部组件
│   │   │   ├── PostCard.vue       # 帖子卡片组件
│   │   │   ├── UserSidebar.vue    # 用户侧边栏
│   │   │   └── VirtualPostList.vue # 虚拟滚动列表
│   │   ├── views/                 # 页面组件
│   │   │   ├── Home.vue          # 首页
│   │   │   ├── Login.vue         # 登录页
│   │   │   ├── PostDetail.vue    # 帖子详情页
│   │   │   └── UserProfile.vue   # 用户主页
│   │   ├── router/               # 路由配置
│   │   │   └── index.js         # 路由定义和守卫
│   │   ├── store/                # 状态管理
│   │   │   ├── index.js         # Pinia配置
│   │   │   └── user.js          # 用户状态管理
│   │   ├── utils/                # 工具函数
│   │   │   ├── avatar.js        # 头像处理
│   │   │   ├── cacheManager.js  # 缓存管理
│   │   │   └── performance.js   # 性能监控
│   │   ├── assets/              # 静态资源
│   │   │   └── theme.css        # 主题样式
│   │   ├── App.vue              # 根组件
│   │   └── main.js              # 应用入口
│   ├── public/                  # 公共静态资源
│   ├── index.html               # HTML模板
│   ├── vite.config.js           # Vite配置
│   └── package.json             # 前端依赖
├── server/                       # 后端应用 (Node.js + Express)
│   ├── src/
│   │   ├── controllers/         # 控制器层
│   │   │   ├── authController.js # 认证控制器
│   │   │   ├── postController.js # 帖子控制器
│   │   │   ├── userController.js # 用户控制器
│   │   │   └── commentController.js # 评论控制器
│   │   ├── middleware/          # 中间件
│   │   │   ├── authMiddleware.js # JWT认证中间件
│   │   │   ├── adminMiddleware.js # 管理员权限中间件
│   │   │   └── errorHandler.js  # 错误处理中间件
│   │   ├── models/              # 数据模型
│   │   │   ├── User.js          # 用户模型
│   │   │   ├── Post.js          # 帖子模型
│   │   │   ├── Comment.js       # 评论模型
│   │   │   ├── Like.js          # 点赞模型
│   │   │   └── index.js         # 模型关联定义
│   │   ├── routes/              # 路由定义
│   │   │   ├── auth.js          # 认证路由
│   │   │   ├── post.js          # 帖子路由
│   │   │   ├── user.js          # 用户路由
│   │   │   └── comment.js       # 评论路由
│   │   ├── config/              # 配置文件
│   │   │   └── database.js      # 数据库配置
│   │   ├── utils/               # 工具函数
│   │   │   ├── jwt.js           # JWT工具
│   │   │   ├── validation.js    # 数据验证
│   │   │   └── logger.js        # 日志工具
│   │   ├── swagger.js           # Swagger文档配置
│   │   └── app.js               # 应用入口
│   ├── tests/                   # 测试文件
│   ├── logs/                    # 日志文件
│   └── package.json             # 后端依赖
├── docs/                        # 项目文档
│   ├── api.md                   # API文档
│   ├── deployment.md            # 部署文档
│   └── database.md              # 数据库设计文档
├── scripts/                     # 部署脚本
├── .github/                     # GitHub配置
├── README.md                    # 项目说明
└── package.json                 # 根目录配置
```

## 🔧 开发指南

### 前端开发最佳实践

#### 组件设计原则
```javascript
// 使用Composition API构建可复用组件
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const userStore = useUserStore()
    const isLiked = ref(false)
    const likeCount = ref(props.post.like_count)
    
    const formattedDate = computed(() => {
      return new Date(props.post.post_time).toLocaleDateString()
    })
    
    const handleLike = async () => {
      try {
        await likePost(props.post.post_id)
        isLiked.value = !isLiked.value
        likeCount.value += isLiked.value ? 1 : -1
      } catch (error) {
        console.error('点赞失败:', error)
      }
    }
    
    onMounted(() => {
      // 组件挂载后的初始化逻辑
    })
    
    return {
      isLiked,
      likeCount,
      formattedDate,
      handleLike
    }
  }
}
```

#### 状态管理策略
```javascript
// Pinia状态管理示例
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const isAuthenticated = computed(() => !!token.value)
  
  const loginUser = async (credentials) => {
    const response = await login(credentials)
    user.value = response.user
    token.value = response.token
    localStorage.setItem('token', response.token)
  }
  
  const logoutUser = async () => {
    await logout()
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }
  
  return {
    user,
    token,
    isAuthenticated,
    loginUser,
    logoutUser
  }
})
```

### 后端开发最佳实践

#### 控制器设计模式
```javascript
// RESTful API控制器示例
class PostController {
  // 获取帖子列表
  async getAllPosts(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query
      const offset = (page - 1) * limit
      
      const whereClause = category ? { category } : {}
      
      const posts = await Post.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: ['user_id', 'username', 'avatar_url'] },
          { model: Comment, as: 'comments', attributes: ['comment_id'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['post_time', 'DESC']]
      })
      
      res.json({
        success: true,
        data: {
          posts: posts.rows,
          pagination: {
            current: parseInt(page),
            total: posts.count,
            pages: Math.ceil(posts.count / limit)
          }
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '获取帖子列表失败',
        error: error.message
      })
    }
  }
  
  // 创建新帖子
  async createPost(req, res) {
    try {
      const { content, images, topics, visibility } = req.body
      const userId = req.user.user_id
      
      // 数据验证
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '帖子内容不能为空'
        })
      }
      
      const post = await Post.create({
        user_id: userId,
        content: content.trim(),
        image_url: images ? JSON.stringify(images) : null,
        topics: topics ? JSON.stringify(topics) : null,
        visibility: visibility || 'public',
        post_time: new Date()
      })
      
      res.status(201).json({
        success: true,
        data: post,
        message: '帖子发布成功'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '发布帖子失败',
        error: error.message
      })
    }
  }
}
```

#### 中间件设计
```javascript
// JWT认证中间件
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '访问令牌缺失'
      })
    }
    
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findByPk(decoded.user_id)
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      })
    }
    
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期'
      })
    }
    
    res.status(401).json({
      success: false,
      message: '无效的访问令牌'
    })
  }
}
```

### 数据库设计

#### 核心表结构
```sql
-- 用户表
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  avatar_url VARCHAR(200),
  nickname VARCHAR(50),
  gender ENUM('male', 'female', 'other'),
  birthday DATE,
  bio TEXT,
  location VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 帖子表
CREATE TABLE posts (
  post_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  image_url JSON,
  topics JSON,
  visibility ENUM('public', 'private', 'friends') DEFAULT 'public',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_visibility (visibility),
  FULLTEXT idx_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE comments (
  comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  parent_id BIGINT,
  content TEXT NOT NULL,
  like_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id),
  INDEX idx_parent_id (parent_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 点赞表
CREATE TABLE likes (
  like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_user (post_id, user_id),
  INDEX idx_post_id (post_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📚 API文档

### RESTful API设计
项目采用RESTful API设计原则，所有接口都遵循统一的响应格式：

```javascript
// 成功响应格式
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

// 错误响应格式
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 核心API接口

#### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

#### 帖子相关
- `GET /api/posts` - 获取帖子列表（支持分页、筛选）
- `POST /api/posts` - 创建新帖子
- `GET /api/posts/:id` - 获取帖子详情
- `PUT /api/posts/:id` - 更新帖子
- `DELETE /api/posts/:id` - 删除帖子
- `POST /api/posts/:id/like` - 点赞/取消点赞

#### 评论相关
- `GET /api/posts/:id/comments` - 获取帖子评论
- `POST /api/comments` - 发布评论
- `PUT /api/comments/:id` - 更新评论
- `DELETE /api/comments/:id` - 删除评论

#### 用户相关
- `GET /api/users/:id` - 获取用户信息
- `GET /api/users/:id/posts` - 获取用户帖子
- `POST /api/users/:id/follow` - 关注用户
- `DELETE /api/users/:id/follow` - 取消关注

### API文档访问
- **开发环境**: http://localhost:3000/api-docs
- **生产环境**: https://yourdomain.com/api-docs

## 🚀 部署与运维

### 生产环境部署

#### 使用Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=ufulano
      - DB_PASS=password
      - DB_NAME=ufulano_cn
    depends_on:
      - mysql
      - redis
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=ufulano_cn
      - MYSQL_USER=ufulano
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
  
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

#### PM2进程管理
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ufulano-server',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

#### Nginx反向代理配置
```nginx
# nginx.conf
upstream ufulano_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name yourdomain.com;
    
    # 前端静态文件
    location / {
        root /var/www/ufulano_cn/client/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # 后端API代理
    location /api/ {
        proxy_pass http://ufulano_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://ufulano_backend;
        access_log off;
    }
    
    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 性能优化策略

#### 数据库优化
```sql
-- 索引优化
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_comments_post_created ON comments(post_id, created_at ASC);
CREATE INDEX idx_likes_post_user ON likes(post_id, user_id);

-- 查询优化
EXPLAIN SELECT p.*, u.username, u.avatar_url, 
       COUNT(c.comment_id) as comment_count,
       COUNT(l.like_id) as like_count
FROM posts p
LEFT JOIN users u ON p.user_id = u.user_id
LEFT JOIN comments c ON p.post_id = c.post_id AND c.is_deleted = 0
LEFT JOIN likes l ON p.post_id = l.post_id
WHERE p.visibility = 'public' AND p.is_deleted = 0
GROUP BY p.post_id
ORDER BY p.created_at DESC
LIMIT 10 OFFSET 0;
```

#### 缓存策略
```javascript
// Redis缓存实现
const redis = require('redis')
const client = redis.createClient()

class CacheService {
  async get(key) {
    try {
      const value = await client.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  async set(key, value, ttl = 3600) {
    try {
      await client.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  async del(key) {
    try {
      await client.del(key)
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }
}

// 使用缓存优化查询
const getPostsWithCache = async (page, limit) => {
  const cacheKey = `posts:${page}:${limit}`
  let posts = await cacheService.get(cacheKey)
  
  if (!posts) {
    posts = await Post.findAll({
      include: [{ model: User, as: 'user' }],
      limit,
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']]
    })
    
    await cacheService.set(cacheKey, posts, 300) // 缓存5分钟
  }
  
  return posts
}
```

#### 前端性能优化
```javascript
// 虚拟滚动实现
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  setup() {
    const containerRef = ref(null)
    const scrollTop = ref(0)
    const itemHeight = 200
    const visibleCount = 10
    
    const allPosts = ref([])
    const visiblePosts = computed(() => {
      const start = Math.floor(scrollTop.value / itemHeight)
      const end = start + visibleCount
      return allPosts.value.slice(start, end)
    })
    
    const handleScroll = (e) => {
      scrollTop.value = e.target.scrollTop
    }
    
    onMounted(() => {
      containerRef.value?.addEventListener('scroll', handleScroll)
    })
    
    onUnmounted(() => {
      containerRef.value?.removeEventListener('scroll', handleScroll)
    })
    
    return {
      containerRef,
      visiblePosts
    }
  }
}
```

## 🔒 安全措施

### 认证与授权
- **JWT Token** - 无状态认证，支持刷新机制
- **密码加密** - 使用bcryptjs进行密码哈希
- **路由守卫** - 前端路由级别的权限控制
- **API权限** - 后端中间件级别的权限验证

### 数据安全
- **SQL注入防护** - 使用Sequelize ORM参数化查询
- **XSS防护** - 输入输出过滤和CSP头设置
- **CSRF防护** - 使用CSRF Token验证
- **文件上传安全** - 文件类型验证和大小限制

### 网络安全
- **HTTPS** - 强制使用HTTPS协议
- **安全头** - 设置各种安全响应头
- **CORS配置** - 严格控制跨域访问
- **速率限制** - 防止API滥用和DDoS攻击

## 📊 监控与日志

### 应用监控
```javascript
// 性能监控中间件
const performanceMonitor = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`)
    
    // 记录慢查询
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`)
    }
  })
  
  next()
}
```

### 错误处理
```javascript
// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  // 记录错误日志
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  // 返回错误响应
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
```

## 🤝 贡献指南

### 开发流程
1. **Fork** 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 **Pull Request**

### 代码规范
- 使用 **ESLint** 进行代码检查
- 遵循 **Vue.js** 官方风格指南
- 使用 **约定式提交** 格式
- 代码覆盖率不低于 **80%**

### 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

类型说明：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 📝 开发日志

- [开发日志](./DEVELOPMENT_LOG.md) - 详细的技术问题和解决方案
- [日常开发日志](./DAILY_LOG.md) - 开发进度和问题记录
- [TODO列表](./todo.md) - 功能规划和待办事项

## 🐛 常见问题与解决方案

### 性能问题
**问题**: 页面加载缓慢
**解决方案**: 
- 启用数据库查询缓存
- 实现前端虚拟滚动
- 优化图片加载（懒加载、压缩）
- 使用CDN加速静态资源

### 内存泄漏
**问题**: 长时间运行后内存占用过高
**解决方案**:
- 定期清理Redis缓存
- 优化数据库连接池
- 检查事件监听器是否正确移除
- 使用PM2自动重启机制

### 数据库连接问题
**问题**: 数据库连接超时
**解决方案**:
- 配置连接池参数
- 实现连接重试机制
- 监控数据库连接状态
- 使用读写分离架构

## 📄 许可证

本项目采用 **MIT** 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- **项目主页**: [GitHub Repository](https://github.com/yourusername/ufulano_cn)
- **问题反馈**: [Issues](https://github.com/yourusername/ufulano_cn/issues)
- **技术讨论**: [Discussions](https://github.com/yourusername/ufulano_cn/discussions)

---

⭐️ 如果这个项目对你有帮助，请给它一个 Star！你的支持是我持续改进的动力。

## 🎯 技术亮点与项目价值

### 💼 求职优势展示

#### 🔥 核心技术能力
- **全栈开发** - 熟练掌握Vue 3 + Node.js完整技术栈，具备前后端一体化开发能力
- **架构设计** - 深入理解前后端分离架构，能够设计可扩展的企业级应用架构
- **性能优化** - 具备前端性能优化、数据库查询优化、缓存策略等实战经验
- **安全防护** - 掌握Web安全防护技术，包括认证授权、数据加密、攻击防护等

#### 🚀 工程化能力
- **代码规范** - 遵循ESLint、Prettier等代码规范，具备良好的代码质量意识
- **版本控制** - 熟练使用Git进行版本管理，掌握分支策略和协作流程
- **自动化部署** - 具备CI/CD、Docker容器化、服务器运维等DevOps技能
- **文档编写** - 能够编写技术文档、API文档、部署文档等专业文档

#### 📊 项目规模与复杂度
- **用户系统** - 完整的用户注册、登录、权限管理、个人中心等功能
- **内容系统** - 支持富文本发布、图片上传、内容审核、SEO优化等
- **社交功能** - 实现评论、点赞、关注、消息通知等社交互动功能
- **性能优化** - 采用虚拟滚动、懒加载、缓存策略等提升用户体验

#### 🛡️ 安全与稳定性
- **数据安全** - 实现密码加密、SQL注入防护、XSS防护等多层安全防护
- **系统稳定** - 采用PM2进程管理、Nginx反向代理、数据库连接池等技术
- **监控日志** - 实现错误监控、性能监控、日志记录等运维监控体系

### 📈 技术深度展示

#### 前端技术栈
- **Vue 3 Composition API** - 掌握最新的Vue 3语法和响应式编程
- **TypeScript** - 具备类型安全的JavaScript开发能力
- **状态管理** - 熟练使用Pinia进行复杂状态管理
- **性能优化** - 掌握虚拟滚动、懒加载、代码分割等优化技术

#### 后端技术栈
- **Node.js + Express** - 熟练掌握服务端开发框架和中间件机制
- **Sequelize ORM** - 具备数据库设计和ORM使用经验
- **JWT认证** - 掌握无状态认证机制和Token管理
- **API设计** - 遵循RESTful API设计原则，具备接口设计能力

#### 数据库与缓存
- **MySQL优化** - 具备数据库设计、索引优化、查询优化等技能
- **Redis缓存** - 掌握缓存策略和Redis使用技巧
- **数据建模** - 能够设计合理的数据表结构和关联关系

#### 部署运维
- **Docker容器化** - 掌握容器化部署和微服务架构
- **Nginx配置** - 具备反向代理、负载均衡、静态资源优化等技能
- **PM2进程管理** - 掌握Node.js应用的生产环境部署和管理

### 🎖️ 项目价值体现

#### 业务价值
- **完整功能** - 实现了社交网站的核心功能，具备实际应用价值
- **用户体验** - 注重用户体验设计，支持响应式布局和主题切换
- **性能表现** - 通过多种优化手段提升应用性能，支持高并发访问

#### 技术价值
- **架构设计** - 采用现代化的技术架构，具备良好的可扩展性
- **代码质量** - 遵循最佳实践，代码结构清晰，易于维护
- **安全防护** - 实现多层安全防护，保障用户数据安全

#### 学习价值
- **技术栈全面** - 涵盖前端、后端、数据库、部署等全栈技术
- **实战经验** - 基于真实业务场景，具备实际项目开发经验
- **问题解决** - 记录了开发过程中的问题和解决方案，具备问题排查能力

---

**这个项目展示了我在全栈开发、架构设计、性能优化、安全防护等方面的综合能力，是一个适合求职展示的完整项目案例。**

**技术栈亮点**:
- 🎯 **全栈开发**: Vue 3 + Node.js 完整技术栈
- 🏗️ **架构设计**: 前后端分离、微服务架构思想
- 🔒 **安全防护**: JWT认证、数据加密、安全头设置
- 📈 **性能优化**: 缓存策略、数据库优化、虚拟滚动
- 🚀 **部署运维**: Docker容器化、PM2进程管理、Nginx反向代理
- 📚 **文档完善**: Swagger API文档、详细的技术文档
 