const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User');
const Post = require('./Post');
const Like = require('./Like');
const Comment = require('./Comment');

// 用户与帖子的关联
User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts' 
});

Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author' 
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
  as: 'author'
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

// 检查关联
console.log('User associations:', Object.keys(User.associations));
console.log('Post associations:', Object.keys(Post.associations));
console.log('Like associations:', Object.keys(Like.associations));
console.log('Comment associations:', Object.keys(Comment.associations));

sequelize.sync({ alter: true }).then(() => {
  console.log('数据库表已同步');
}).catch(err => {
  console.error('数据库同步错误:', err);
});

module.exports = { User, Post, Like, Comment, sequelize };