# 部署检查清单

## 服务器端部署步骤

### 1. 数据库准备
- [ ] 确保数据库 `ufulano` 存在
- [ ] 创建所有必要的表：
  - [ ] `Users` 表
  - [ ] `Posts` 表  
  - [ ] `Likes` 表
  - [ ] `Comments` 表
  - [ ] `Reposts` 表
- [ ] 运行数据库初始化脚本：
  ```bash
  # 点赞功能
  mysql -u ufulano -p ufulano < setup-like-feature.sql
  
  # 转发功能  
  mysql -u ufulano -p ufulano < create-repost-table.sql
  ```

### 2. 服务器代码部署
- [ ] 上传最新的服务器代码
- [ ] 安装依赖：
  ```bash
  cd ufulano_cn/server
  npm install
  ```
- [ ] 测试路由和控制器：
  ```bash
  node test-routes.js
  ```
- [ ] 重启服务器：
  ```bash
  # 如果使用 PM2
  pm2 restart ufulano-server
  
  # 或者直接重启
  npm start
  ```

### 3. 前端代码部署
- [ ] 上传最新的前端代码
- [ ] 安装依赖：
  ```bash
  cd ufulano_cn/client
  npm install
  ```
- [ ] 构建前端：
  ```bash
  npm run build
  ```

### 4. 功能测试
- [ ] 测试用户登录/注册
- [ ] 测试帖子发布
- [ ] 测试点赞功能：
  - [ ] 点赞帖子
  - [ ] 取消点赞
  - [ ] 查看点赞状态
- [ ] 测试转发功能：
  - [ ] 转发帖子
  - [ ] 查看转发列表
  - [ ] 转发帖子显示

## 常见问题排查

### 1. 路由404错误
**症状**：`POST /api/repost 404 (Not Found)`
**解决方案**：
- 检查服务器是否重启
- 检查路由文件是否存在
- 检查 app.js 中路由注册

### 2. 点赞500错误
**症状**：`POST /api/likes/:id 500 (Internal Server Error)`
**解决方案**：
- 检查 Likes 表是否存在
- 检查 Like 模型是否正确导入
- 查看服务器日志获取详细错误信息

### 3. 数据库连接问题
**症状**：数据库连接失败
**解决方案**：
- 检查数据库配置
- 检查数据库服务是否运行
- 检查用户权限

## 日志检查

### 服务器日志
```bash
# 查看服务器日志
tail -f ufulano_cn/server/combined.log
tail -f ufulano_cn/server/error.log
```

### 数据库日志
```bash
# 查看 MySQL 错误日志
tail -f /var/log/mysql/error.log
```

## 性能监控

### 1. 服务器资源
- CPU 使用率
- 内存使用率
- 磁盘空间

### 2. 数据库性能
- 连接数
- 查询性能
- 慢查询日志

### 3. 应用性能
- API 响应时间
- 错误率
- 并发用户数

## 备份策略

### 1. 代码备份
- 定期备份代码仓库
- 保留多个版本

### 2. 数据库备份
```bash
# 每日备份
mysqldump -u ufulano -p ufulano > backup_$(date +%Y%m%d).sql
```

### 3. 配置文件备份
- 备份环境变量
- 备份数据库配置
- 备份服务器配置

## 安全检查

### 1. 权限检查
- 数据库用户权限
- 文件系统权限
- 服务器端口访问

### 2. 安全配置
- JWT 密钥安全
- 数据库密码安全
- HTTPS 配置

### 3. 日志安全
- 敏感信息脱敏
- 日志文件权限
- 日志轮转配置
