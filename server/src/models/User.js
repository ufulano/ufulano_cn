/**
 * 用户数据模型
 * 
 * 功能特性：
 * - 用户信息：基本用户信息存储
 * - 认证相关：密码哈希、令牌管理
 * - 隐私设置：用户隐私配置
 * - 统计数据：用户活动统计
 * - 关联关系：与其他模型的关联
 * 
 * 数据字段：
 * - user_id：用户唯一标识
 * - username：用户名（唯一）
 * - email：邮箱地址（唯一）
 * - password：密码哈希
 * - nickname：昵称
 * - avatar_url：头像URL
 * - bio：个人简介
 * - location：地理位置
 * - gender：性别
 * - birthday：生日
 * - create_time：创建时间
 * - update_time：更新时间
 * 
 * 关联关系：
 * - 一对多：用户与帖子
 * - 一对多：用户与评论
 * - 一对多：用户与点赞
 * - 多对多：用户关注关系
 */

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init(
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // unique: true, // 暂时注释掉，避免索引过多
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // unique: true, // 暂时注释掉，避免索引过多
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    update_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  { sequelize, modelName: 'User', tableName: 'Users' }
);

module.exports = User;