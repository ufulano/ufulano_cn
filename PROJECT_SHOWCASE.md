# Ufulano.cn 社交平台 - 项目展示

## 📋 项目概述

**Ufulano.cn** 是一个基于现代Web技术栈构建的社交平台项目，采用前后端分离架构，实现了完整的用户系统、内容管理、社交互动等功能。项目展示了全栈开发能力，具备企业级应用的技术水准。

### 🎯 技术栈

#### 前端技术
- **Vue 3** + **Composition API** - 现代化响应式框架
- **Element Plus** - 企业级UI组件库
- **Pinia** - Vue 3官方状态管理库
- **Vue Router** - 单页面应用路由管理
- **Axios** - HTTP客户端库
- **Vite** - 现代化构建工具

#### 后端技术
- **Node.js** + **Express.js** - 服务端运行环境和Web框架
- **Sequelize** - Node.js ORM数据库工具
- **MySQL 8.0** - 关系型数据库
- **JWT** - JSON Web Token身份认证
- **bcryptjs** - 密码加密库
- **Swagger** - API文档生成工具

## 🏗️ 项目架构

### 前端架构
```
client/src/
├── components/          # 可复用组件
│   ├── AppHeader.vue   # 应用头部
│   ├── PostCard.vue    # 帖子卡片
│   ├── RepostCard.vue  # 转发卡片
│   ├── PostStream.vue  # 帖子流
│   ├── UserSidebar.vue # 用户侧边栏
│   └── ...
├── views/              # 页面组件
│   ├── Home.vue        # 首页
│   ├── Login.vue       # 登录页
│   ├── Register.vue    # 注册页
│   ├── PostDetail.vue  # 帖子详情
│   └── UserProfile.vue # 用户主页
├── api/                # API接口封装
├── store/              # 状态管理
├── router/             # 路由配置
└── utils/              # 工具函数
```

### 后端架构
```
server/src/
├── controllers/        # 控制器层
│   ├── authController.js    # 认证控制器
│   ├── postController.js   # 帖子控制器
│   ├── userController.js   # 用户控制器
│   ├── commentController.js # 评论控制器
│   ├── likeController.js   # 点赞控制器
│   └── repostController.js # 转发控制器
├── models/             # 数据模型
│   ├── User.js         # 用户模型
│   ├── Post.js         # 帖子模型
│   ├── Comment.js      # 评论模型
│   ├── Like.js         # 点赞模型
│   └── Repost.js       # 转发模型
├── routes/             # 路由定义
├── middleware/         # 中间件
├── config/             # 配置文件
└── utils/              # 工具函数
```

## 🔧 核心功能实现

### 1. 用户认证系统

#### 功能特性
- **用户注册/登录** - 支持用户名和邮箱注册
- **JWT身份认证** - 无状态Token认证机制
- **密码加密** - 使用bcryptjs进行密码哈希
- **记住我功能** - 支持长期登录状态保持
- **自动登录** - 页面刷新后自动恢复登录状态

#### 技术实现
```javascript
// 用户状态管理 (Pinia Store)
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null,
    rememberMe: false,
    tokenExpiry: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    displayName: (state) => state.user?.nickname || state.user?.username || '未知用户'
  },
  
  actions: {
    setUser(token, user, rememberMe = false) {
      this.token = token
      this.user = user
      this.rememberMe = rememberMe
      this.saveToStorage()
    }
  }
})
```

#### 数据库设计
```sql
-- 用户表结构
CREATE TABLE Users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  gender ENUM('Male', 'Female', 'Other'),
  birthday DATE,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. 帖子管理系统

#### 功能特性
- **帖子发布** - 支持文字、图片内容发布
- **图片上传** - 支持多图片上传和显示
- **内容编辑** - 支持帖子内容修改
- **软删除** - 支持帖子软删除机制
- **分页查询** - 高性能的分页加载
- **搜索功能** - 支持帖子内容搜索

#### 技术实现
```javascript
// 帖子数据模型
class Post extends Model {}
Post.init({
  post_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: { model: 'Users', key: 'user_id' }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    collate: 'utf8mb4_general_ci'
  },
  image_url: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: '图片数据，使用LONGTEXT类型存储'
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  repost_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, { sequelize, modelName: 'Post', tableName: 'Posts' })
```

#### 前端组件
```vue
<!-- PostCard.vue - 帖子卡片组件 -->
<template>
  <div class="post-card">
    <!-- 帖子头部 -->
    <div class="post-header">
      <div class="post-avatar-wrapper">
        <el-avatar :src="parseAvatar(avatar)" size="large" />
      </div>
      <div class="post-userinfo">
        <div class="post-username">{{ username }}</div>
        <div class="post-meta">
          <span class="post-time">{{ time }}</span>
        </div>
      </div>
    </div>
    
    <!-- 帖子内容 -->
    <div class="post-content" @click="handleContentClick">{{ content }}</div>
    
    <!-- 图片显示 -->
    <div v-if="images && images.length" class="post-images">
      <div v-for="(img, index) in images" :key="index" class="post-image-wrapper">
        <LazyImage :src="img" :alt="`图片 ${index + 1}`" />
      </div>
    </div>
    
    <!-- 互动操作 -->
    <div class="post-actions">
      <div class="action-btn" @click="handleLike">
        <el-icon><Star /></el-icon>
        <span>赞</span>
        <span v-if="likeCount" class="action-count">{{ likeCount }}</span>
      </div>
      <div class="action-btn" @click="handleComment">
        <el-icon><ChatLineSquare /></el-icon>
        <span>评论</span>
        <span v-if="commentCount" class="action-count">{{ commentCount }}</span>
      </div>
      <div class="action-btn" @click="handleRepost">
        <el-icon><Share /></el-icon>
        <span>转发</span>
        <span v-if="repostCount" class="action-count">{{ repostCount }}</span>
      </div>
    </div>
  </div>
</template>
```

### 3. 点赞系统

#### 功能特性
- **点赞/取消点赞** - 支持帖子点赞操作
- **防重复点赞** - 数据库唯一约束防止重复
- **实时计数** - 点赞数量实时更新
- **状态同步** - 前端状态与后端数据同步
- **批量查询** - 支持批量获取点赞状态

#### 技术实现
```javascript
// 点赞API实现
export async function toggleLike(postId) {
  try {
    const response = await request.post(`/likes/${postId}`)
    return response.data
  } catch (error) {
    throw new Error('点赞操作失败')
  }
}

// 前端点赞处理
const handleLike = async () => {
  try {
    const response = await toggleLike(props.post.post_id)
    isLiked.value = response.liked
    likeCount.value = response.likeCount
    ElMessage.success(response.message)
  } catch (error) {
    ElMessage.error('点赞失败，请重试')
  }
}
```

#### 数据库设计
```sql
-- 点赞表结构
CREATE TABLE Likes (
  like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  post_id BIGINT NOT NULL,
  like_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_post_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);
```

### 4. 转发系统

#### 功能特性
- **转发帖子** - 支持转发其他用户的帖子
- **转发评论** - 转发时可添加个人评论
- **转发链显示** - 类似微博的转发链展示
- **嵌套转发** - 支持多层转发结构
- **转发统计** - 转发数量统计和显示

#### 技术实现
```javascript
// 转发API实现
export async function createRepost(data) {
  return request.post('/repost', data)
}

// 转发组件实现
const onPublishRepost = async () => {
  try {
    const response = await createRepost({
      originalPostId: props.post.post_id,
      repostContent: repostText.value.trim() || null
    })
    ElMessage.success('转发成功')
    emit('repost', { post: props.post, repostData: response.data })
  } catch (error) {
    ElMessage.error('转发失败，请重试')
  }
}
```

#### 转发卡片组件
```vue
<!-- RepostCard.vue - 转发卡片组件 -->
<template>
  <div class="repost-chain-card">
    <!-- 转发链条连接线 -->
    <div class="chain-line"></div>
    
    <!-- 当前转发层 -->
    <div class="repost-layer">
      <!-- 转发信息头部 -->
      <div class="repost-header">
        <div class="repost-info">
          <el-icon class="repost-icon"><Share /></el-icon>
          <span class="repost-text">
            <strong>{{ reposterName }}</strong> 转发了
          </span>
        </div>
        <div class="repost-time">{{ formatTime(post.post_time) }}</div>
      </div>

      <!-- 转发内容 -->
      <div v-if="post.content" class="repost-content">
        <p class="repost-text-content">{{ post.content }}</p>
      </div>

      <!-- 原帖内容 -->
      <div class="original-post">
        <!-- 递归显示嵌套转发 -->
        <RepostCard 
          v-if="originalPost.is_repost && originalPost.originalPost"
          :post="originalPost"
          :current-user-id="currentUserId"
        />
        
        <!-- 普通原帖内容 -->
        <template v-else>
          <div class="original-post-header">
            <div class="user-info">
              <el-avatar :src="originalPost.user?.avatar_url" :size="32" />
              <div class="user-details">
                <span class="username">{{ originalPost.user?.nickname || originalPost.user?.username }}</span>
                <span class="user-handle">@{{ originalPost.user?.username }}</span>
              </div>
            </div>
          </div>
          <div class="original-content">
            <p v-if="originalPost.content" class="original-text">{{ originalPost.content }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
```

### 5. 评论系统

#### 功能特性
- **评论发布** - 支持对帖子进行评论
- **嵌套评论** - 支持评论的回复功能
- **表情支持** - 支持表情符号输入
- **评论管理** - 支持评论编辑和删除
- **实时更新** - 评论数量实时统计

#### 技术实现
```javascript
// 评论API实现
export async function addComment(data) {
  return request.post('/comments', data)
}

// 评论发布处理
const onPublishComment = async () => {
  if (!commentText.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  commentLoading.value = true
  
  try {
    const response = await addComment({
      post_id: props.post.post_id,
      content: commentText.value.trim()
    })
    
    if (response.success) {
      commentText.value = ''
      showCommentBar.value = false
      ElMessage.success('评论成功')
    }
  } catch (error) {
    ElMessage.error('评论失败，请重试')
  } finally {
    commentLoading.value = false
  }
}
```

### 6. 图片处理系统

#### 功能特性
- **图片上传** - 支持多图片上传
- **图片压缩** - 自动压缩大图片
- **懒加载** - 图片懒加载优化性能
- **图片预览** - 支持图片点击预览
- **多图布局** - 智能的多图网格布局

#### 技术实现
```javascript
// 图片懒加载组件
export default {
  name: 'LazyImage',
  props: {
    src: String,
    alt: String
  },
  setup(props) {
    const imgRef = ref(null)
    const loaded = ref(false)
    const error = ref(false)
    
    const loadImage = () => {
      const img = new Image()
      img.onload = () => {
        loaded.value = true
      }
      img.onerror = () => {
        error.value = true
      }
      img.src = props.src
    }
    
    onMounted(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadImage()
          observer.disconnect()
        }
      })
      observer.observe(imgRef.value)
    })
    
    return { imgRef, loaded, error }
  }
}
```

## 📊 项目规模

### 代码统计
- **前端代码**: 8,000+ 行
- **后端代码**: 6,000+ 行
- **组件数量**: 15+ 个Vue组件
- **API接口**: 20+ 个RESTful接口
- **数据库表**: 5+ 个核心业务表

### 文件结构
```
ufulano_cn/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/    # 15个组件文件
│   │   ├── views/         # 7个页面文件
│   │   ├── api/           # 6个API文件
│   │   ├── store/         # 状态管理
│   │   ├── router/        # 路由配置
│   │   └── utils/         # 工具函数
│   └── package.json
├── server/                # 后端应用
│   ├── src/
│   │   ├── controllers/   # 6个控制器
│   │   ├── models/        # 5个数据模型
│   │   ├── routes/        # 6个路由文件
│   │   ├── middleware/     # 中间件
│   │   └── config/        # 配置文件
│   └── package.json
└── docs/                  # 项目文档
```

## 🔒 安全特性

### 认证安全
- **JWT Token认证** - 无状态身份验证
- **密码加密** - bcryptjs哈希加密
- **Token过期机制** - 自动过期和刷新
- **路由守卫** - 前端路由权限控制

### 数据安全
- **SQL注入防护** - Sequelize ORM参数化查询
- **XSS防护** - 输入输出过滤
- **CSRF防护** - 跨站请求伪造防护
- **文件上传安全** - 文件类型和大小限制

### 网络安全
- **CORS配置** - 跨域资源共享控制
- **请求验证** - 输入数据验证和过滤
- **错误处理** - 统一错误处理和日志记录

## 🚀 性能优化

### 前端优化
- **虚拟滚动** - VirtualPostList组件处理大量数据
- **图片懒加载** - LazyImage组件优化图片加载
- **组件缓存** - 合理使用Vue组件缓存
- **代码分割** - Vite构建工具代码分割

### 后端优化
- **数据库索引** - 关键字段建立索引
- **查询优化** - 优化SQL查询性能
- **分页查询** - 高效的分页数据加载
- **错误处理** - 完善的错误处理机制

### 缓存策略
- **本地存储** - localStorage用户状态持久化
- **图片缓存** - 图片加载缓存机制
- **状态管理** - Pinia状态持久化

## 📱 响应式设计

### 移动端适配
- **响应式布局** - 适配各种屏幕尺寸
- **触摸优化** - 移动端触摸交互优化
- **性能优化** - 移动端性能优化

### 用户体验
- **加载状态** - 完善的加载状态提示
- **错误反馈** - 友好的错误提示信息
- **操作反馈** - 及时的操作结果反馈

## 🛠️ 开发工具

### 前端工具
- **Vite** - 现代化构建工具
- **Vue DevTools** - Vue开发调试工具
- **Element Plus** - UI组件库
- **Axios** - HTTP请求库

### 后端工具
- **Express.js** - Web应用框架
- **Sequelize** - ORM数据库工具
- **Swagger** - API文档工具
- **JWT** - 身份认证工具

### 开发环境
- **Node.js 18+** - 运行环境
- **MySQL 8.0** - 数据库
- **Git** - 版本控制

## 📚 项目文档

### 技术文档
- **API文档** - Swagger自动生成的接口文档
- **数据库设计** - 详细的表结构和关系设计
- **组件文档** - Vue组件使用说明
- **部署文档** - 项目部署和配置说明

### 开发日志
- **功能实现日志** - 详细的功能开发记录
- **问题解决记录** - 开发过程中的问题解决方案
- **性能优化记录** - 性能优化的具体措施

## 🎯 技术亮点

### 1. 现代化技术栈
- 使用Vue 3 Composition API构建响应式界面
- 采用Pinia进行状态管理
- 基于Sequelize ORM的数据库操作
- JWT无状态认证机制

### 2. 组件化开发
- 高度复用的Vue组件设计
- 清晰的组件职责划分
- 良好的组件通信机制
- 统一的组件设计规范

### 3. 性能优化
- 虚拟滚动处理大量数据
- 图片懒加载优化加载性能
- 合理的缓存策略
- 数据库查询优化

### 4. 用户体验
- 响应式设计适配多设备
- 实时交互反馈
- 友好的错误处理
- 流畅的动画效果

### 5. 代码质量
- 统一的代码规范
- 完善的错误处理
- 详细的代码注释
- 模块化的代码结构

## 🔧 部署说明

### 环境要求
- Node.js 18.0+
- MySQL 8.0+
- npm 8.0+

### 安装步骤
1. 克隆项目并安装依赖
2. 配置数据库连接
3. 设置环境变量
4. 启动开发服务器

### 访问地址
- 前端应用: http://localhost:5173
- 后端API: http://localhost:3000
- API文档: http://localhost:3000/api-docs

## 📈 项目价值

### 技术价值
- 展示了全栈开发能力
- 体现了现代化技术栈的应用
- 具备企业级应用的技术水准
- 代码结构清晰，易于维护

### 学习价值
- 涵盖了前端、后端、数据库等全栈技术
- 基于真实业务场景的实战项目
- 记录了完整的问题解决过程
- 具备良好的扩展性

### 展示价值
- 适合作为求职作品展示
- 体现了技术深度和广度
- 展示了工程化开发能力
- 具备实际应用价值

---

**这个项目充分展示了我在Vue 3、Node.js、MySQL等现代Web技术栈方面的综合能力，是一个完整的企业级社交平台项目，适合作为技术能力和项目经验的展示。**
