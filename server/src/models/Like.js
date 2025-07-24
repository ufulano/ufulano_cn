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
  }
);

module.exports = Like;