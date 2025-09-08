# Ufulano 社交网站 API 文档

**版本**: 1.0.0

**描述**: 基于 OpenAPI 3.0 的自动生成接口文档

**联系方式**: Ufulano Team (contact@ufulano.cn)

## 🌐 服务器地址

- **开发服务器**: `http://localhost:3000`
- **生产服务器**: `https://your-domain.com`

## 🔐 认证方式

本项目使用JWT Bearer Token进行身份认证。

在请求头中添加: `Authorization: Bearer <your-token>`

## 📋 Auth

### POST /api/login

**描述**: 用户登录

**请求体**:

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          },
          "remember": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

**响应**:

- **200**: 登录成功

---

### POST /api/register

**描述**: 用户注册

**请求体**:

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**响应**:

- **201**: 注册成功

---

## 📋 Comment

### GET /api/comments/{postId}

**描述**: 获取某帖评论流

**响应**:

- **200**: 评论列表

---

### POST /api/comments

**描述**: 发布评论

**认证要求**: 需要JWT Token

**请求体**:

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "postId": {
            "type": "integer"
          },
          "content": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**响应**:

- **201**: 评论发布成功

---

## 📋 Post

### GET /api/getAllPosts

**描述**: 获取所有帖子

**响应**:

- **200**: 帖子列表

---

### POST /api/createPost

**描述**: 创建新帖子

**认证要求**: 需要JWT Token

**请求体**:

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "content": {
            "type": "string"
          },
          "images": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "topics": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "visibility": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**响应**:

- **201**: 帖子创建成功

---

## 📋 User

### POST /api/user/avatar

**描述**: 更新用户头像

**认证要求**: 需要JWT Token

**请求体**:

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "avatar_url": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**响应**:

- **200**: 头像更新成功

---

### PUT /api/user/profile

**描述**: 更新用户信息

**认证要求**: 需要JWT Token

**请求体**:

```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": {
        "type": "object",
        "properties": {
          "nickname": {
            "type": "string"
          },
          "bio": {
            "type": "string"
          },
          "location": {
            "type": "string"
          },
          "gender": {
            "type": "string"
          },
          "birthday": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

**响应**:

- **200**: 用户信息更新成功

---

### GET /api/user/{userId}

**描述**: 获取用户信息

**响应**:

- **200**: 用户信息

---

### GET /api/user/{userId}/posts

**描述**: 获取用户帖子

**响应**:

- **200**: 用户帖子列表

---

## 🔗 相关链接

- [在线API文档](http://localhost:3000/api-docs)
- [项目主页](../README.md)
- [项目设计文档](./PROJECT_DESIGN.md)
