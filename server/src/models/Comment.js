/**
 * 评论数据模型
 * 
 * 功能特性：
 * - 评论内容：文字评论内容存储
 * - 回复系统：支持评论回复
 * - 用户关联：评论者信息关联
 * - 帖子关联：评论所属帖子
 * - 软删除：支持评论软删除
 * 
 * 数据字段：
 * - comment_id：评论唯一标识
 * - post_id：所属帖子ID
 * - user_id：评论用户ID
 * - comment_content：评论内容
 * - parent_id：父评论ID（回复功能）
 * - reply_to_user_id：回复用户ID
 * - is_deleted：软删除标记
 * - comment_time：评论时间
 * - update_time：更新时间
 * 
 * 关联关系：
 * - 多对一：评论属于帖子
 * - 多对一：评论属于用户
 * - 一对多：评论可以有回复
 */

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Comment extends Model {}

Comment.init(
  {
    comment_id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
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
    comment_content: {
      type: DataTypes.TEXT,
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    comment_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments', // 表名
    timestamps: false,
  }
);

module.exports = Comment;