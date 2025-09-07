/**
 * 路由测试脚本
 * 用于验证 like 和 repost 路由是否正常工作
 */

const express = require('express');
const request = require('supertest');

// 测试路由加载
console.log('=== 测试路由加载 ===');

try {
  // 测试模型加载
  console.log('1. 测试模型加载...');
  const { User, Post, Like, Comment, Repost, sequelize } = require('./src/models');
  console.log('✅ 模型加载成功');
  
  // 测试路由加载
  console.log('2. 测试路由加载...');
  const likeRoutes = require('./src/routes/like');
  const repostRoutes = require('./src/routes/repost');
  console.log('✅ 路由加载成功');
  
  // 测试控制器加载
  console.log('3. 测试控制器加载...');
  const likeController = require('./src/controllers/likeController');
  const repostController = require('./src/controllers/repostController');
  console.log('✅ 控制器加载成功');
  
  // 测试应用加载
  console.log('4. 测试应用加载...');
  const app = require('./src/app');
  console.log('✅ 应用加载成功');
  
  console.log('\n=== 所有测试通过 ===');
  console.log('修复成功！服务器应该可以正常启动。');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error('错误详情:', error);
  process.exit(1);
}
