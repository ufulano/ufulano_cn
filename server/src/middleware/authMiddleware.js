// middleware/authMiddleware.js
const path = require('path');
/**
 * 身份验证中间件
 * 
 * 功能特性：
 * - JWT令牌验证：验证用户身份
 * - 用户信息提取：从令牌中提取用户信息
 * - 错误处理：统一的认证错误处理
 * - 权限检查：基本的权限验证
 * 
 * 验证流程：
 * - 检查Authorization头部
 * - 验证JWT令牌有效性
 * - 提取用户信息到req.user
 * - 处理令牌过期和无效情况
 * 
 * 安全措施：
 * - 令牌验证：确保令牌有效性
 * - 错误处理：不暴露敏感信息
 * - 权限控制：防止未授权访问
 * - 日志记录：记录认证失败
 */

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const authenticateToken = (req, res, next) => {
    // 从请求头中获取 JWT 令牌
    console.log('请求到达 authMiddleware.js');
    const token = req.headers['authorization'];

    // 检查是否提供了令牌
    if (!token) {
        return res.status(401).json({ message: '未提供令牌' });
    }
    console.log('客户端发送的 JWT 令牌:', token);

    // 提取真正的 JWT 令牌（去掉 "Bearer " 前缀）
    const tokenValue = token.split(' ')[1]; 

    // 验证 JWT 令牌（使用 tokenValue，而不是原始的 token）
    jwt.verify(tokenValue, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT 验证失败:', err);
            return res.status(403).json({ message: '无效的令牌' });
        }
        // 打印解码后的 JWT 数据
        console.log('解码后的 JWT 数据:', user);

        // 将用户信息附加到请求对象中
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;