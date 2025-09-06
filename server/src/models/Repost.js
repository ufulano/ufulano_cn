/**
 * 转发数据模型
 * 
 * 功能特性：
 * - 转发记录：记录用户转发帖子的关系
 * - 转发内容：支持转发时添加评论
 * - 软删除：支持转发记录的软删除
 * - 关联关系：与用户、原帖的关联
 * 
 * 数据字段：
 * - repost_id：转发记录唯一标识
 * - user_id：转发用户ID
 * - original_post_id：原帖ID
 * - repost_content：转发时添加的内容
 * - repost_time：转发时间
 * - is_deleted：软删除标记
 * 
 * 关联关系：
 * - 多对一：转发记录属于用户
 * - 多对一：转发记录关联原帖
 */

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Repost extends Model {}

Repost.init(
  {
    repost_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'user_id',
      },
    },
    original_post_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'Posts',
        key: 'post_id',
      },
    },
    repost_content: {
      type: DataTypes.TEXT,
      allowNull: true,
      collate: 'utf8mb4_general_ci',
      comment: '转发时添加的内容',
    },
    repost_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    is_deleted: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
      comment: '是否删除 0:未删除 1:已删除',
    },
  },
  {
    sequelize,
    modelName: 'Repost',
    tableName: 'Reposts',
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['original_post_id']
      },
      {
        fields: ['repost_time']
      },
      {
        fields: ['user_id', 'original_post_id']
      }
    ]
  }
);

module.exports = Repost;

