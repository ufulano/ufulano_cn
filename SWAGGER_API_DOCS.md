# Swagger API 文档说明

## 📍 文档位置

Swagger自动生成的API文档位于：
- **开发环境**: http://localhost:3000/api-docs
- **生产环境**: https://your-domain.com/api-docs

## 🔧 技术实现

### 配置文件
- **swagger.js** (第1-22行): Swagger配置和UI设置
- **app.js** (第48行, 第198行): Swagger集成到Express应用

### 依赖包
- **swagger-jsdoc**: 从JSDoc注释生成OpenAPI规范
- **swagger-ui-express**: 提供交互式API文档界面

## 📋 已文档化的API接口

### 认证接口 (Auth)
- `POST /api/login` - 用户登录
- `POST /api/register` - 用户注册

### 帖子接口 (Post)  
- `GET /api/getAllPosts` - 获取所有帖子
- `POST /api/createPost` - 创建新帖子

### 用户接口 (User)
- 用户信息相关接口

### 评论接口 (Comment)
- 评论相关接口

## 🎯 功能特点

1. **自动生成**: 基于代码中的@swagger注释自动生成
2. **交互式测试**: 可直接在界面中测试API接口
3. **实时更新**: 代码更新后文档自动同步
4. **标准规范**: 遵循OpenAPI 3.0标准
5. **分类管理**: 按功能模块分组显示

## 📝 使用说明

1. 启动后端服务器: `npm start`
2. 访问文档地址: http://localhost:3000/api-docs
3. 在界面中查看和测试API接口
4. 支持在线调试和参数验证

## 🔄 维护方式

- 在路由文件中添加@swagger注释即可自动更新文档
- 无需手动维护，完全自动化
- 支持版本控制和变更追踪
