/**
 * 帖子数据模型
 * 
 * 功能特性：
 * - 帖子内容：文字、图片、视频内容存储
 * - 互动统计：点赞、评论、转发数量
 * - 隐私控制：帖子可见性设置
 * - 软删除：支持帖子软删除
 * - 关联关系：与用户、评论、点赞的关联
 * 
 * 数据字段：
 * - post_id：帖子唯一标识
 * - user_id：发布用户ID
 * - content：帖子内容
 * - image_url：图片URL（JSON格式）
 * - video_url：视频URL
 * - topics：话题标签
 * - visibility：可见性设置
 * - like_count：点赞数量
 * - comment_count：评论数量
 * - repost_count：转发数量
 * - view_count：浏览数量
 * - is_deleted：软删除标记
 * - post_time：发布时间
 * - update_time：更新时间
 * 
 * 关联关系：
 * - 多对一：帖子属于用户
 * - 一对多：帖子有多个评论
 * - 一对多：帖子有多个点赞
 */

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Post extends Model {}

Post.init(
  {
    post_id: {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      collate: 'utf8mb4_general_ci',
    },
    image_url: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      defaultValue: null,
      comment: '图片数据，使用LONGTEXT类型存储'
    },
    post_time: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    },
    repost_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: '转发的原推文ID',
    },
    repost_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '转发数',
    },
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '点赞数',
    },
    comment_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: '评论数',
    },
    visibility: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      comment: '可见范围:0公开 1粉丝 2私密',
    },
    topics: {
      type: DataTypes.STRING(255),
      allowNull: true,
      collate: 'utf8mb4_general_ci',
      comment: '话题标签，多个用逗号分隔',
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'Posts', // 表名
    timestamps: false,
  }
);

module.exports = Post;