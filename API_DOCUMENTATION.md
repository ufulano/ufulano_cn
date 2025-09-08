# Ufulano.cn 社交平台 - API 文档

## 📋 概述

本文档详细描述了 Ufulano.cn 社交平台的所有 RESTful API 接口，包括认证、用户管理、帖子管理、评论系统、点赞系统和转发系统等功能模块。

### 基础信息
- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 统一响应格式

#### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 错误响应
```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 认证模块 (Auth)

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "nickname": "string"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "user": {
    "user_id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户"
  }
}
```

### 路由测试
```http
GET /api/auth/test
```

## 👤 用户模块 (Users)

### 更新用户头像
```http
POST /api/users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "avatar": "file"
}
```

### 更新用户信息
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "string",
  "bio": "string",
  "location": "string",
  "gender": "Male|Female|Other",
  "birthday": "YYYY-MM-DD"
}
```

### 获取用户信息
```http
GET /api/users/:userId
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar_url": "https://example.com/avatar.jpg",
    "bio": "这是我的个人简介",
    "location": "北京",
    "gender": "Male",
    "birthday": "1990-01-01",
    "create_time": "2024-01-01T00:00:00.000Z"
  }
}
```

### 获取用户帖子
```http
GET /api/users/:userId/posts?page=1&limit=10
```

### 获取用户点赞的帖子
```http
GET /api/users/:userId/likes?page=1&limit=10
```

## 📝 帖子模块 (Posts)

### 获取所有帖子
```http
GET /api/posts?page=1&limit=10&category=all
```

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `category`: 分类筛选 (可选)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "post_id": 1,
        "user_id": 1,
        "content": "这是一条测试帖子",
        "image_url": "[\"https://example.com/image1.jpg\"]",
        "like_count": 5,
        "comment_count": 3,
        "repost_count": 1,
        "post_time": "2024-01-01T00:00:00.000Z",
        "user": {
          "user_id": 1,
          "username": "testuser",
          "nickname": "测试用户",
          "avatar_url": "https://example.com/avatar.jpg"
        }
      }
    ],
    "pagination": {
      "current": 1,
      "total": 100,
      "pages": 10
    }
  }
}
```

### 创建帖子
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string",
  "images": ["string"],
  "topics": ["string"],
  "visibility": "public|private|friends"
}
```

### 搜索帖子
```http
GET /api/posts/search?q=关键词&page=1&limit=10
```

### 获取热门帖子
```http
GET /api/posts/hot?limit=10
```

### 获取推荐帖子
```http
GET /api/posts/recommended?limit=10
```

## 💬 评论模块 (Comments)

### 获取帖子评论
```http
GET /api/comments/:postId?page=1&limit=20
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "comment_id": 1,
      "post_id": 1,
      "user_id": 1,
      "content": "这是一条评论",
      "like_count": 2,
      "created_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "user_id": 1,
        "username": "testuser",
        "nickname": "测试用户",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

### 发布评论
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "post_id": 1,
  "content": "string",
  "parent_id": 1
}
```

**请求参数**:
- `post_id`: 帖子ID (必填)
- `content`: 评论内容 (必填)
- `parent_id`: 父评论ID (可选，用于回复)

### 更新评论
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "string"
}
```

### 删除评论
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

## ❤️ 点赞模块 (Likes)

### 点赞/取消点赞
```http
POST /api/likes/:postId
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "liked": true,
  "message": "点赞成功",
  "likeCount": 15
}
```

### 获取帖子点赞数
```http
GET /api/likes/:postId
```

**响应示例**:
```json
{
  "likes": 15
}
```

### 检查点赞状态
```http
GET /api/likes/:postId/status
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "liked": true,
  "likeCount": 15
}
```

### 获取用户点赞历史
```http
GET /api/likes/user/history?page=1&limit=20
Authorization: Bearer <token>
```

### 批量获取点赞数
```http
POST /api/likes/batch-counts
Content-Type: application/json

{
  "postIds": [1, 2, 3, 4, 5]
}
```

**响应示例**:
```json
{
  "1": 10,
  "2": 5,
  "3": 0,
  "4": 25,
  "5": 3
}
```

### 获取点赞最多的帖子
```http
GET /api/likes/top/:limit?
```

### 管理员删除点赞记录
```http
DELETE /api/likes/admin/:likeId
Authorization: Bearer <token>
```

### 点赞数据日报
```http
GET /api/likes/analytics/daily
Authorization: Bearer <token>
```

## 🔄 转发模块 (Reposts)

### 转发帖子
```http
POST /api/reposts
Authorization: Bearer <token>
Content-Type: application/json

{
  "originalPostId": 123,
  "repostContent": "转发时添加的内容（可选）"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "repost_id": 1,
    "user_id": 1,
    "original_post_id": 123,
    "repost_content": "转发时添加的内容",
    "repost_time": "2024-01-01T00:00:00.000Z"
  },
  "message": "转发成功"
}
```

### 取消转发
```http
DELETE /api/reposts/:repostId
Authorization: Bearer <token>
```

### 获取帖子转发列表
```http
GET /api/reposts/posts/:postId?page=1&limit=20
Authorization: Bearer <token>
```

### 获取用户转发历史
```http
GET /api/reposts/users/:userId?page=1&limit=20
Authorization: Bearer <token>
```

### 检查转发状态
```http
GET /api/reposts/posts/:postId/status
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "success": true,
  "reposted": true,
  "repostId": 1,
  "repostCount": 5
}
```

## 🔧 前端路由 (Vue Router)

### 路由配置
文件：`client/src/router/index.js`

| 路由 | 组件 | 说明 |
|------|------|------|
| `/#/` | `Home.vue` | 首页 |
| `/#/login` | `Login.vue` | 登录页 |
| `/#/register` | `Register.vue` | 注册页 |
| `/#/community` | `Community.vue` | 社区中心 |
| `/#/post/:id` | `PostDetail.vue` | 帖子详情 |
| `/#/user/:id` | `UserProfile.vue` | 用户主页 |
| `/#/settings` | `AccountSettings.vue` | 账号设置 |

### 路由守卫
- **公开页面白名单**: `/`、`/login`、`/register`、`/community`、`/^\/post\//`、`/^\/user\//`
- **需要登录的页面**: 其他所有页面
- **Token过期处理**: 自动登出并跳转登录页

## 📊 数据库设计

### 核心表结构

#### Users 表
```sql
CREATE TABLE Users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  avatar_url TEXT,
  nickname VARCHAR(50),
  gender ENUM('Male', 'Female', 'Other'),
  birthday DATE,
  bio TEXT,
  location VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Posts 表
```sql
CREATE TABLE Posts (
  post_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  image_url JSON,
  topics JSON,
  visibility ENUM('public', 'private', 'friends') DEFAULT 'public',
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  repost_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
```

#### Comments 表
```sql
CREATE TABLE Comments (
  comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  parent_id BIGINT,
  content TEXT NOT NULL,
  like_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES Comments(comment_id) ON DELETE CASCADE
);
```

#### Likes 表
```sql
CREATE TABLE Likes (
  like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_post_user (post_id, user_id)
);
```

#### Reposts 表
```sql
CREATE TABLE Reposts (
  repost_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  original_post_id BIGINT NOT NULL,
  repost_content TEXT NULL,
  repost_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (original_post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);
```

## 🔒 安全与权限

### 认证机制
- **JWT Token**: 无状态身份认证
- **Token过期**: 24小时自动过期
- **权限验证**: 中间件级别的权限控制
- **密码加密**: bcryptjs哈希加密

### 权限控制
- **公开接口**: 登录、注册、获取公开内容
- **用户接口**: 需要Bearer Token认证
- **管理员接口**: 需要管理员权限验证

### 数据验证
- **输入验证**: express-validator参数校验
- **SQL注入防护**: Sequelize ORM参数化查询
- **XSS防护**: 输入输出过滤
- **文件上传安全**: 文件类型和大小限制

## 📈 性能优化

### 数据库优化
- **索引优化**: 关键字段建立索引
- **查询优化**: 避免N+1查询问题
- **分页查询**: 高效的分页数据加载
- **连接池**: 数据库连接池管理

### 缓存策略
- **HTTP缓存**: 静态资源缓存
- **应用缓存**: 热点数据缓存
- **前端缓存**: localStorage状态持久化

### 接口优化
- **批量操作**: 支持批量查询和操作
- **异步处理**: 非关键操作异步处理
- **错误重试**: 网络错误自动重试机制

## 🐛 错误处理

### HTTP状态码
- **200**: 成功
- **201**: 创建成功
- **400**: 请求参数错误
- **401**: 未认证
- **403**: 权限不足
- **404**: 资源不存在
- **413**: 请求数据过大
- **500**: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📚 使用示例

### 完整的用户操作流程

#### 1. 用户注册
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    nickname: '测试用户'
  })
});
```

#### 2. 用户登录
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'testuser',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.token);
```

#### 3. 发布帖子
```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    content: '这是我的第一条帖子',
    visibility: 'public'
  })
});
```

#### 4. 点赞帖子
```javascript
const response = await fetch('/api/likes/1', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

#### 5. 转发帖子
```javascript
const response = await fetch('/api/reposts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    originalPostId: 1,
    repostContent: '转发这条帖子'
  })
});
```

## 🔧 开发工具

### API文档工具
- **Swagger UI**: http://localhost:3000/api-docs
- **Postman**: 接口测试和调试
- **Insomnia**: 轻量级API客户端

### 调试工具
- **浏览器开发者工具**: 网络请求调试
- **Vue DevTools**: 前端状态调试
- **MySQL Workbench**: 数据库调试

---

**本文档涵盖了 Ufulano.cn 社交平台的所有API接口，为前端开发和第三方集成提供了完整的参考。**
