/**
 * 数据模型索引文件
 * 
 * 功能特性：
 * - 模型定义：所有数据模型的定义
 * - 关联关系：模型之间的关联关系设置
 * - 数据库连接：Sequelize实例配置
 * - 模型导出：统一导出所有模型
 * 
 * 模型列表：
 * - User：用户模型
 * - Post：帖子模型
 * - Comment：评论模型
 * - Like：点赞模型
 * 
 * 关联关系：
 * - User -> Post：一对多
 * - User -> Comment：一对多
 * - User -> Like：一对多
 * - Post -> Comment：一对多
 * - Post -> Like：一对多
 * - Comment -> Comment：自关联（回复）
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Post = require('./Post');
const Like = require('./Like');
const Comment = require('./Comment');
const Repost = require('./Repost');

// 用户与帖子的关联
User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts' 
});

Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user' // 统一别名
});

// 用户与点赞的关联
User.hasMany(Like, {
  foreignKey: 'user_id',
  as: 'likes'
});

Like.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 帖子与点赞的关联
Post.hasMany(Like, {
  foreignKey: 'post_id',
  as: 'likes'
});

Like.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

// 用户与评论的关联
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments'
});

Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user' // 统一别名
});

// 帖子与评论的关联
Post.hasMany(Comment, {
  foreignKey: 'post_id',
  as: 'comments'
});

Comment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

// 用户与转发的关联
User.hasMany(Repost, {
  foreignKey: 'user_id',
  as: 'reposts'
});

Repost.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 帖子与转发的关联
Post.hasMany(Repost, {
  foreignKey: 'original_post_id',
  as: 'reposts'
});

Repost.belongsTo(Post, {
  foreignKey: 'original_post_id',
  as: 'originalPost'
});

// 帖子自关联（转发关系）
Post.belongsTo(Post, {
  foreignKey: 'repost_id',
  as: 'originalPost'
});

Post.hasMany(Post, {
  foreignKey: 'repost_id',
  as: 'reposts'
});

// 检查关联
console.log('User associations:', Object.keys(User.associations));
console.log('Post associations:', Object.keys(Post.associations));
console.log('Like associations:', Object.keys(Like.associations));
console.log('Comment associations:', Object.keys(Comment.associations));
console.log('Repost associations:', Object.keys(Repost.associations));

sequelize.sync({ alter: true }).then(() => {
  console.log('数据库表已同步');
}).catch(err => {
  console.error('数据库同步错误:', err);
});

module.exports = { User, Post, Like, Comment, Repost, sequelize };