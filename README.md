# Ufulano 社交网站开发文档

---

## 目录
- [项目简介](#项目简介)
- [目录结构](#目录结构)
- [本地开发环境搭建](#本地开发环境搭建)
- [生产部署与服务器配置](#生产部署与服务器配置)
- [数据库表结构](#数据库表结构)
- [API接口文档](#api接口文档)
- [前端开发说明](#前端开发说明)
- [后端开发说明](#后端开发说明)
- [协作与分支管理](#协作与分支管理)
- [开发进度与日志](#开发进度与日志)
- [常见问题与建议](#常见问题与建议)

---

## 项目简介
Ufulano 是一个现代化、响应式的社交网站，前端基于 Vue3 + Vite + Element Plus，后端基于 Node.js + Express + Sequelize，支持用户注册、登录、发帖、评论、点赞、个人主页等核心功能，支持主题切换、夜间模式、自动化接口文档（Swagger/OpenAPI）。

---

## 目录结构
```
ufulano_cn/
  ├── client/           # 前端 Vue3 + Vite + Element Plus
  │   ├── src/
  │   │   ├── api/      # API 封装
  │   │   ├── components/
  │   │   ├── views/    # 页面组件
  │   │   ├── router/   # 路由配置
  │   │   ├── store/    # 状态管理
  │   │   └── ...
  │   └── ...
  └── server/           # 后端 Node.js + Express + Sequelize
      ├── src/
      │   ├── controllers/ # 控制器（详见下文）
      │   ├── middleware/  # 中间件（详见下文）
      │   ├── models/      # Sequelize 模型（详见下文）
      │   ├── routes/      # 路由（详见下文）
      │   ├── config/      # 数据库配置
      │   ├── swagger.js   # Swagger/OpenAPI 文档配置
      │   └── app.js       # 入口
      └── ...
```

---

## 本地开发环境搭建

### 前端
```bash
cd ufulano_cn/client
npm install
npm run dev
# 访问 http://localhost:5173
```

### 后端
```bash
cd ufulano_cn/server
npm install
node src/app.js
# 访问 http://localhost:3000
# Swagger文档 http://localhost:3000/api-docs
```

> 默认测试账号：testuser / test123

#### Vite 代理配置
详见 `client/vite.config.js`，已配置 `/api` 自动代理到后端 3000 端口。

#### 依赖说明
- 前端依赖详见 `client/package.json`
- 后端依赖详见 `server/package.json`

---

## 生产部署与服务器配置

### 宝塔Linux服务器+GitHub Webhook自动部署
1. 宝塔面板“软件商店”一键安装 Node.js、MySQL。
2. 推荐项目目录：`/www/wwwroot/ufulano_cn`
3. 新建自动部署脚本 `/www/server/panel/script/deploy_ufulano.sh`：
```bash
#!/bin/bash
cd /www/wwwroot/ufulano_cn
/usr/bin/git pull origin master
cd server && /usr/bin/npm install
cd ../client && /usr/bin/npm install && /usr/bin/npm run build
cd ../server && /usr/bin/pm2 restart ufulano-server || /usr/bin/pm2 start src/app.js --name ufulano-server
```
4. 脚本加权限：`chmod +x /www/server/panel/script/deploy_ufulano.sh`
5. GitHub 仓库 `Settings` → `Webhooks` → `Add webhook`，Payload URL 填宝塔 Webhook 地址，Content type 选 `application/json`，事件选 `push`。
6. 每次 push 自动部署，日志见宝塔“计划任务”或“面板日志”。

### Nginx 配置示例
详见 `nginx.conf` 或宝塔面板，核心片段：
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        root /path/to/ufulano_cn/client/dist;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2 进程管理
详见 `https://pm2.keymetrics.io/`，常用命令：
```bash
npm install -g pm2
pm2 start src/app.js --name ufulano-server
pm2 status
pm2 logs ufulano-server
pm2 restart ufulano-server
pm2 stop ufulano-server
pm2 delete ufulano-server
pm2 startup
pm2 save
```

---

## 数据库表结构

### 用户表（User）
| 字段         | 类型         | 说明         |
| ------------ | ------------ | ------------ |
| user_id      | BIGINT PK    | 用户ID       |
| username     | VARCHAR(50)  | 用户名       |
| password     | VARCHAR(100) | 密码（加密） |
| email        | VARCHAR(100) | 邮箱         |
| avatar_url   | VARCHAR(200) | 头像地址     |
| nickname     | VARCHAR(50)  | 昵称         |
| gender       | ENUM         | 性别         |
| birthday     | DATE         | 生日         |
| bio          | TEXT         | 个人简介     |
| location     | VARCHAR(100) | 地区         |
| create_time  | DATETIME     | 注册时间     |
| update_time  | DATETIME     | 更新时间     |

### 帖子表（Post）
详见 `server/src/models/Post.js`，主要字段：post_id, user_id, content, image_url, topics, visibility, post_time, like_count, comment_count

### 评论表（Comment）
详见 `server/src/models/Comment.js`，主要字段：comment_id, post_id, user_id, content, comment_time

### 点赞表（Like）
详见 `server/src/models/Like.js`，主要字段：like_id, post_id, user_id, like_time

> Sequelize模型定义详见 models 目录，字段类型、默认值、索引等以代码为准。

---

## Sequelize 关联别名（as）对照表

| 模型      | 关联方法         | 目标模型 | 别名（as） | 说明           |
|-----------|------------------|----------|------------|----------------|
| User      | hasMany          | Post     | posts      | 用户的所有帖子 |
| User      | hasMany          | Like     | likes      | 用户的所有点赞 |
| User      | hasMany          | Comment  | comments   | 用户的所有评论 |
| Post      | belongsTo        | User     | user       | 帖子的作者     |
| Post      | hasMany          | Like     | likes      | 帖子的所有点赞 |
| Post      | hasMany          | Comment  | comments   | 帖子的所有评论 |
| Like      | belongsTo        | User     | user       | 点赞的用户     |
| Like      | belongsTo        | Post     | post       | 点赞的帖子     |
| Comment   | belongsTo        | User     | user       | 评论的作者     |
| Comment   | belongsTo        | Post     | post       | 评论的帖子     |

### 代码中如何访问
- 查询帖子时 include：`{ model: User, as: 'user' }`，访问 `post.user`
- 查询用户时 include：`{ model: Post, as: 'posts' }`，访问 `user.posts`
- 查询评论时 include：`{ model: User, as: 'user' }`，访问 `comment.user`
- 查询点赞时 include：`{ model: User, as: 'user' }`，访问 `like.user`

---

## API接口文档

### 访问方式
- Swagger/OpenAPI 自动生成，访问：`http://localhost:3000/api-docs`
- 支持在线调试、导出 OpenAPI JSON

### 主要接口一览
| 路径                | 方法 | 参数/Body                | 说明           |
|---------------------|------|--------------------------|----------------|
| /api/login          | POST | username, password, remember | 用户登录       |
| /api/register       | POST | username, email, password    | 用户注册       |
| /api/getAllPosts    | GET  | -                        | 获取所有帖子   |
| /api/createPost     | POST | content, images, topics, visibility | 创建新帖子（需登录） |
| /api/posts/:id      | GET  | -                        | 获取单个帖子详情 |
| /api/comments/:postId | GET | -                        | 获取某帖评论流 |
| /api/comments       | POST | postId, content          | 发布评论（需登录） |
| /api/likes/:postId  | POST | -                        | 点赞/取消点赞（需登录） |
| /api/likes/:postId  | GET  | -                        | 获取帖子点赞数 |
| /api/likes/user/history | GET | -                      | 获取当前用户点赞历史（需登录） |

### 参数与响应示例
详见 Swagger UI，每个接口均有详细参数、响应结构、示例。

### 路由与控制器说明
- 路由定义详见 `server/src/routes/` 目录
- 业务逻辑详见 `server/src/controllers/` 目录
- 权限校验详见 `server/src/middleware/authMiddleware.js`

---

## 前端开发说明

### 技术栈
- Vue3 + Vite + Element Plus
- Pinia 全局状态管理
- Axios 封装 API 请求，自动携带 token
- 支持主题切换、夜间模式

### 主要页面与功能
- 首页（帖子流、点赞、跳转详情、公开可见）
- 登录/注册（Pinia存储用户信息，支持记住我）
- 发帖（图片、话题、可见性、API对接，需登录）
- 帖子详情（内容、评论、点赞、评论发布，评论需登录）
- 个人主页（用户信息、帖子、点赞历史，需登录）
- 路由守卫：未登录可浏览公开内容，发帖/个人中心需登录

### 目录与代码规范
- 组件、API、状态、样式分目录管理，详见 `client/src/`
- 代码风格建议统一，推荐使用 ESLint/Prettier

### 主题与样式
- 魔戒风格主题，支持夜间模式（body.night）
- 主题变量详见 `client/src/assets/theme.css`

---

## 后端开发说明

### 技术栈
- Node.js + Express + Sequelize
- JWT 认证，token 校验中间件
- 自动插入测试账号 testuser/test123（开发环境）
- Swagger/OpenAPI 自动文档

### 目录与代码规范
- 控制器、模型、路由、中间件分目录管理，详见 `server/src/`
- 代码风格建议统一，推荐使用 ESLint

### 主要中间件
- `authMiddleware.js`：JWT 校验
- `adminMiddleware.js`：管理员权限校验（预留）
- `errorHandler.js`：统一错误处理（建议补充）

### 自动化与部署
- 推荐用 pm2 管理 Node 服务，nginx 反向代理
- 支持 GitHub Webhook 自动部署，详见上文
- 数据库、配置文件注意备份和权限安全

---

## 协作与分支管理
- 每个功能/bugfix新建分支，开发完成后合并主分支
- GitHub 远程仓库建议开启 Webhook 自动部署
- 代码提交规范、分支命名建议：
  - feat/xxx 新功能
  - fix/xxx  修复
  - docs/xxx 文档
  - refactor/xxx 重构
- 推荐定期 code review，合并前自测

---

## 开发进度与日志
- [开发日志](./DEVELOPMENT_LOG.md) - 详细的问题记录和解决方案
- [日常开发日志](./DAILY_LOG.md) - 快速记录模板和今日问题
- [TODO列表](./todo.md) - 待办事项和功能规划

包括每次主要功能完善、API对接、UI优化、自动化等。

---

## 常见问题与建议

### 端口冲突
- 用 `netstat -ano | findstr :端口` 查找并 `taskkill /PID xxx /F` 关闭

### 依赖缺失/安装失败
- 确认在正确目录下 `npm install`
- Windows 下如遇 bcrypt 报错，已用 bcryptjs 替换

### 数据库连接失败
- 检查 `server/src/config/database.js` 或 .env 配置
- 本地开发可忽略，生产环境需正确配置

### 前端页面无法显示
- 确认在 `client` 目录下 `npm run dev`
- 缺少 @vitejs/plugin-vue 时 `npm install @vitejs/plugin-vue`
- 如无 `vite.config.js`，详见上文配置

### 其它建议
- 推荐前后端分离开发，接口联调用代理
- 生产环境建议用 pm2、nginx、https、定期备份
- 代码管理建议用分支协作、定期 push
- 自动化测试、CI/CD、接口文档建议逐步补充

---

如需进一步细化某一部分（如表结构 SQL、接口文档、CI/CD、自动化脚本等），请随时补充需求！
 