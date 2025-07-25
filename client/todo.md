# 项目功能实现情况汇总

## 1. 首页帖子流
- **前端文件**：
  - `client/src/views/Home.vue`
  - `client/src/components/PostCard.vue`
- **API**：
  - `GET /api/getAllPosts` (`fetchPosts`)
- **数据库**：
  - `Posts` 表
- **已实现**：
  - fetchPosts、PostCard展示
- **未实现**：
  - 搜索功能、分页、筛选

---

## 2. 帖子详情
- **前端文件**：
  - `client/src/views/PostDetail.vue`
  - `client/src/components/PostCard.vue`
- **API**：
  - `GET /api/posts/:id` (`fetchPost`)
  - `GET /api/comments?postId=xxx` (`fetchComments`)
  - `POST /api/comments` (`addComment`)
- **数据库**：
  - `Posts`、`Comments` 表
- **已实现**：
  - fetchPost、fetchComments、addComment、PostCard评论区
- **未实现**：
  - 点赞、转发、评论图片上传

---

## 3. 用户登录/注册
- **前端文件**：
  - `client/src/views/Login.vue`
  - `client/src/views/Register.vue`
  - `client/src/store/user.js`
- **API**：
  - `POST /api/login` (`login`)
  - `POST /api/register` (`register`)
- **数据库**：
  - `Users` 表
- **已实现**：
  - login、register、setUser、logout
- **未实现**：
  - 第三方登录、验证码、找回密码

---

## 4. 社区中心
- **前端文件**：
  - `client/src/views/Community.vue`
- **API**：
  - 无（目前为静态内容）
- **数据库**：
  - 无
- **已实现**：
  - 页面展示
- **未实现**：
  - 热门话题、推荐内容、最新帖子API对接

---

## 5. 用户信息/个人中心
- **前端文件**：
  - `client/src/components/AppHeader.vue`
  - `client/src/store/user.js`
- **API**：
  - `GET /api/userinfo` (`fetchUserInfo`)
- **数据库**：
  - `Users` 表
- **已实现**：
  - fetchUserInfo、setUser、logout
- **未实现**：
  - 用户资料编辑、头像上传、关注/粉丝/收藏/赞API对接 