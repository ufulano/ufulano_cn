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