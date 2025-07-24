# Ufulano 社交网站开发文档

## 目录
- [1. 实现功能与开发指引](#1-实现功能与开发指引)
- [2. 目录结构](#2-目录结构)
- [3. 服务器配置与常用指令](#3-服务器配置与常用指令)
- [4. 数据库表结构说明](#4-数据库表结构说明)
- [5. 本地开发与部署](#5-本地开发与部署)
- [6. GitHub 关联](#6-github-关联)
- [7. 常见问题与建议](#7-常见问题与建议)
- [8. 宝塔Linux服务器+GitHub Webhook自动部署](#8-宝塔linux服务器github-webhook自动部署)

---

## 1. 实现功能与开发指引

### 1.1 用户认证
- [x] 登录/注册（前后端表单、API、token 存储）
- [ ] 用户信息完善、头像上传（可扩展）

### 1.2 帖子系统
- [x] 帖子流展示（首页）
- [x] 发帖（文本、图片、话题、可见性）
- [ ] 帖子编辑、删除（可扩展）

### 1.3 评论与点赞
- [ ] 评论功能（接口已预留，需补充后端逻辑和前端交互）
- [ ] 点赞功能（接口已预留，需补充后端逻辑和前端交互）

### 1.4 个人主页
- [ ] 用户信息展示、用户帖子、点赞历史

### 1.5 管理与安全
- [ ] 管理员接口（如删除评论、封禁用户等）
- [ ] 权限校验、接口安全

#### 开发建议
- 每一功能建议先写好接口骨架（controller），前端用 mock 数据开发页面，后端再补全逻辑。
- 推荐前后端分支协作，功能开发完成后合并主分支。

---

## 2. 目录结构

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
      │   ├── controllers/ # 控制器
      │   ├── middleware/  # 中间件
      │   ├── models/      # Sequelize 模型
      │   ├── routes/      # 路由
      │   ├── config/      # 数据库配置
      │   └── app.js       # 入口
      └── ...
```

---

## 3. 服务器配置与常用指令

### 3.1 Node.js、npm、MySQL 安装
```bash
sudo apt update
sudo apt install nodejs npm mysql-server
```

### 3.2 克隆代码与依赖安装
```bash
git clone <你的仓库地址>
cd ufulano_cn/server && npm install
cd ../client && npm install
```

### 3.3 启动服务
```bash
# 后端
cd ufulano_cn/server
node src/app.js &
# 前端
cd ../client
npm run build
# 用 nginx 或 cp dist 到 server/public
```

### 3.4 PM2 进程管理
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

### 3.5 Nginx 配置示例
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

---

## 4. 数据库表结构说明（示例）

### 4.1 用户表（User）
| 字段         | 类型         | 说明         |
| ------------ | ------------ | ------------ |
| user_id      | INT PK       | 用户ID       |
| username     | VARCHAR      | 用户名       |
| email        | VARCHAR      | 邮箱         |
| password     | VARCHAR      | 密码（加密） |
| avatar_url   | VARCHAR      | 头像地址     |
| created_at   | DATETIME     | 注册时间     |

### 4.2 帖子表（Post）
| 字段         | 类型         | 说明         |
| ------------ | ------------ | ------------ |
| post_id      | INT PK       | 帖子ID       |
| user_id      | INT FK       | 作者ID       |
| content      | TEXT         | 帖子内容     |
| image_url    | TEXT/JSON    | 图片数组     |
| topics       | VARCHAR      | 话题         |
| visibility   | INT          | 可见性       |
| post_time    | DATETIME     | 发布时间     |
| like_count   | INT          | 点赞数       |
| comment_count| INT          | 评论数       |

### 4.3 评论表（Comment）
| 字段         | 类型         | 说明         |
| ------------ | ------------ | ------------ |
| comment_id   | INT PK       | 评论ID       |
| post_id      | INT FK       | 帖子ID       |
| user_id      | INT FK       | 评论者ID     |
| content      | TEXT         | 评论内容     |
| comment_time | DATETIME     | 评论时间     |

### 4.4 点赞表（Like）
| 字段         | 类型         | 说明         |
| ------------ | ------------ | ------------ |
| like_id      | INT PK       | 点赞ID       |
| post_id      | INT FK       | 帖子ID       |
| user_id      | INT FK       | 点赞者ID     |
| like_time    | DATETIME     | 点赞时间     |

> 具体字段以 models 目录下 Sequelize 定义为准，可根据业务扩展。

---

## 5. 本地开发与部署
（详见前文“本地开发环境搭建”“Ubuntu 服务器部署指南”）

---

## 6. GitHub 关联
（详见前文“与 GitHub 关联”）

---

## 7. 常见问题与建议
- 端口冲突、依赖缺失、数据库连接失败等见前文“常见问题与解决”
- 推荐前后端分离开发，接口联调用代理
- 生产环境建议用 pm2、nginx、https、定期备份
- 代码管理建议用分支协作、定期 push

---

## 8. 宝塔Linux服务器+GitHub Webhook自动部署

### 8.1 宝塔环境准备
- 在宝塔面板“软件商店”一键安装 Node.js、MySQL。
- 推荐项目目录：`/www/wwwroot/ufulano_cn`

### 8.2 配置自动部署脚本
1. 在宝塔面板“计划任务”中新建 Shell 脚本（如 `/www/server/panel/script/deploy_ufulano.sh`）：

```bash
#!/bin/bash
cd /www/wwwroot/ufulano_cn
# 拉取最新代码
/usr/bin/git pull origin master
# 安装依赖
cd server && /usr/bin/npm install
cd ../client && /usr/bin/npm install && /usr/bin/npm run build
# 重启后端服务（假设用pm2）
cd ../server && /usr/bin/pm2 restart ufulano-server || /usr/bin/pm2 start src/app.js --name ufulano-server
```
> 注意：`/usr/bin/git`、`/usr/bin/npm` 路径请根据实际环境调整，可用 `which git` `which npm` 查询。

2. 给脚本加执行权限：
```bash
chmod +x /www/server/panel/script/deploy_ufulano.sh
```

### 8.3 配置 GitHub Webhook
1. 在 GitHub 仓库 `Settings` → `Webhooks` → `Add webhook`
2. Payload URL 填写宝塔面板的 Webhook 地址（如用宝塔的“Webhook触发器”插件，或用第三方 node-webhook 服务）
3. Content type 选 `application/json`
4. 选择 `Just the push event.`
5. Secret 可自定义

### 8.4 Webhook 触发自动部署
- 每次 push 到 GitHub，Webhook 会自动触发宝塔脚本，完成代码拉取、依赖安装、前端打包、后端重启。
- 可在宝塔“计划任务”或“面板日志”查看执行情况。

### 8.5 生产环境建议
- 用 pm2 管理 Node 服务，保证断线自动重启
- 前端打包后 dist 目录可用 nginx 静态托管
- 数据库、配置文件注意备份和权限安全

---

如需进一步细化某一部分（如表结构 SQL、接口文档、CI/CD、自动化脚本等），请随时补充需求！ 

---

## 解决方法

请务必在 `ufulano_cn/client` 目录下执行：

```bash
npm install @vitejs/plugin-vue
```

如果你还没有 `vite.config.js`，请让我帮你自动生成一个标准的 Vite+Vue 配置文件，否则 Vite 也不会自动加载该插件。

### 标准 vite.config.js 示例

如果你没有该文件，请在 `ufulano_cn/client` 目录下新建 `vite.config.js`，内容如下：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

---

## 步骤总结

1. 进入前端目录：
   ```bash
   cd ufulano_cn/client
   ```
2. 安装依赖：
   ```bash
   npm install @vitejs/plugin-vue
   ```
3. 检查或新建 `vite.config.js`，内容如上。
4. 重启开发服务器：
   ```bash
   npm run dev
   ```

---

## 10. 后端 API 接口列表

### 用户相关
| 路径                | 方法 | 参数/Body                | 说明           |
|---------------------|------|--------------------------|----------------|
| /api/login          | POST | username, password, remember | 用户登录       |
| /api/register       | POST | username, email, password    | 用户注册       |

### 帖子相关
| 路径                | 方法 | 参数/Body                | 说明           |
|---------------------|------|--------------------------|----------------|
| /api/getAllPosts    | GET  | -                        | 获取所有帖子   |
| /api/createPost     | POST | content, images, topics, visibility | 创建新帖子（需登录） |
| /api/posts/:id      | GET  | -                        | 获取单个帖子详情 |

### 评论相关
| 路径                | 方法 | 参数/Body                | 说明           |
|---------------------|------|--------------------------|----------------|
| /api/comments/:postId | GET | -                        | 获取某帖评论流 |
| /api/comments       | POST | postId, content          | 发布评论（需登录） |

### 点赞相关
| 路径                | 方法 | 参数/Body                | 说明           |
|---------------------|------|--------------------------|----------------|
| /api/likes/:postId  | POST | -                        | 点赞/取消点赞（需登录） |
| /api/likes/:postId  | GET  | -                        | 获取帖子点赞数 |
| /api/likes/:postId/status | GET | -                    | 检查当前用户是否点赞（需登录） |
| /api/likes/user/history | GET | -                      | 获取当前用户点赞历史（需登录） |

> 具体参数和响应格式详见 controllers 目录实现，可根据业务扩展。

---
