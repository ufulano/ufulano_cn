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
      type: DataTypes.LONGTEXT,
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