/**
 * 点赞功能初始化脚本
 * 
 * 功能：
 * - 创建点赞表
 * - 更新Posts表结构
 * - 初始化点赞相关数据
 * - 优化数据库索引
 * 
 * 使用方法：
 * node setup-like-feature.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'ufulano',
  password: '81t8WhDnPYN6mchy',
  database: 'ufulano',
  charset: 'utf8mb4'
};

async function setupLikeFeature() {
  let connection;
  
  try {
    console.log('🚀 开始初始化点赞功能...');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'setup-like-feature.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // 分割SQL语句
    const sqlStatements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 准备执行 ${sqlStatements.length} 条SQL语句`);
    
    // 执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      try {
        console.log(`执行第 ${i + 1} 条SQL: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
        console.log(`✅ 第 ${i + 1} 条SQL执行成功`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || 
            error.code === 'ER_DUP_FIELDNAME' ||
            error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  第 ${i + 1} 条SQL跳过（表、字段或索引已存在）`);
        } else {
          console.error(`❌ 第 ${i + 1} 条SQL执行失败:`, error.message);
          // 对于非关键错误，继续执行
          if (!statement.includes('SHOW')) {
            console.log('继续执行下一条SQL...');
          }
        }
      }
    }
    
    // 验证表结构
    console.log('\n🔍 验证表结构...');
    
    // 检查Likes表
    const [likeTable] = await connection.execute('SHOW TABLES LIKE "Likes"');
    if (likeTable.length > 0) {
      console.log('✅ Likes表创建成功');
      
      // 显示表结构
      const [likeStructure] = await connection.execute('DESCRIBE Likes');
      console.log('📋 Likes表结构:');
      likeStructure.forEach(field => {
        console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${field.Key ? `(${field.Key})` : ''}`);
      });
    } else {
      console.log('❌ Likes表创建失败');
    }
    
    // 检查Posts表的点赞字段
    const [postFields] = await connection.execute('SHOW COLUMNS FROM Posts LIKE "%like%"');
    console.log(`✅ Posts表点赞相关字段: ${postFields.length} 个`);
    postFields.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type}`);
    });
    
    // 检查索引
    console.log('\n📊 检查索引...');
    const [likeIndexes] = await connection.execute('SHOW INDEX FROM Likes');
    console.log('Likes表索引:');
    likeIndexes.forEach(index => {
      console.log(`  - ${index.Key_name}: ${index.Column_name} (${index.Non_unique ? '非唯一' : '唯一'})`);
    });
    
    // 统计现有数据
    console.log('\n📈 数据统计...');
    const [likeCount] = await connection.execute('SELECT COUNT(*) as count FROM Likes');
    const [postCount] = await connection.execute('SELECT COUNT(*) as count FROM Posts');
    console.log(`现有点赞记录: ${likeCount[0].count} 条`);
    console.log(`现有帖子数量: ${postCount[0].count} 条`);
    
    console.log('\n🎉 点赞功能初始化完成！');
    console.log('\n📚 使用说明:');
    console.log('1. 重启服务器以加载新的模型和路由');
    console.log('2. 前端已集成点赞功能，可以直接使用');
    console.log('3. API端点:');
    console.log('   - POST /api/likes/:postId - 点赞/取消点赞');
    console.log('   - GET /api/likes/:postId - 获取帖子点赞数');
    console.log('   - GET /api/likes/:postId/status - 检查点赞状态');
    console.log('   - GET /api/likes/user/history - 获取用户点赞历史');
    console.log('   - POST /api/likes/batch-counts - 批量获取点赞数');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行初始化
if (require.main === module) {
  setupLikeFeature();
}

module.exports = setupLikeFeature;

