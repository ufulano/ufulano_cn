/**
 * 点赞数据模型
 * 
 * 功能特性：
 * - 点赞记录：用户点赞记录存储
 * - 用户关联：点赞用户信息
 * - 帖子关联：被点赞的帖子
 * - 时间记录：点赞时间记录
 * - 防重复：防止重复点赞
 * 
 * 数据字段：
 * - like_id：点赞唯一标识
 * - user_id：点赞用户ID
 * - post_id：被点赞帖子ID
 * - like_time：点赞时间
 * 
 * 关联关系：
 * - 多对一：点赞属于用户
 * - 多对一：点赞属于帖子
 * - 唯一约束：用户对同一帖子只能点赞一次
 */

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Like extends Model {}

Like.init(
  {
    like_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Users', // 关联到 User 表
        key: 'user_id',
      },
    },
    post_id: {
      type: DataTypes.BIGINT,
      allowNull: false, 
      references: {
        model: 'Posts', // 关联到 Post 表
        key: 'post_id',
      },
    },
    like_time: {
     type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'Likes', // 表名
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['post_id']
      },
      {
        fields: ['like_time']
      },
      {
        unique: true,
        fields: ['user_id', 'post_id'],
        name: 'unique_user_post_like'
      }
    ]
  }
);

module.exports = Like;