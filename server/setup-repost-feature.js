/**
 * 转发功能初始化脚本
 * 
 * 功能：
 * - 创建转发表
 * - 更新Posts表结构
 * - 初始化转发相关数据
 * 
 * 使用方法：
 * node setup-repost-feature.js
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

async function setupRepostFeature() {
  let connection;
  
  try {
    console.log('🚀 开始初始化转发功能...');
    
    // 连接数据库
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'create-repost-table.sql');
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
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  第 ${i + 1} 条SQL跳过（表或字段已存在）`);
        } else {
          console.error(`❌ 第 ${i + 1} 条SQL执行失败:`, error.message);
          throw error;
        }
      }
    }
    
    // 验证表结构
    console.log('\n🔍 验证表结构...');
    
    // 检查Reposts表
    const [repostTable] = await connection.execute('SHOW TABLES LIKE "Reposts"');
    if (repostTable.length > 0) {
      console.log('✅ Reposts表创建成功');
      
      // 显示表结构
      const [repostStructure] = await connection.execute('DESCRIBE Reposts');
      console.log('📋 Reposts表结构:');
      repostStructure.forEach(field => {
        console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${field.Key ? `(${field.Key})` : ''}`);
      });
    } else {
      console.log('❌ Reposts表创建失败');
    }
    
    // 检查Posts表的转发字段
    const [postFields] = await connection.execute('SHOW COLUMNS FROM Posts LIKE "repost%"');
    console.log(`✅ Posts表转发相关字段: ${postFields.length} 个`);
    postFields.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type}`);
    });
    
    console.log('\n🎉 转发功能初始化完成！');
    console.log('\n📚 使用说明:');
    console.log('1. 重启服务器以加载新的模型和路由');
    console.log('2. 前端已集成转发功能，可以直接使用');
    console.log('3. API端点:');
    console.log('   - POST /api/repost - 转发帖子');
    console.log('   - DELETE /api/repost/:id - 取消转发');
    console.log('   - GET /api/repost/post/:postId - 获取帖子转发列表');
    console.log('   - GET /api/repost/user/:userId - 获取用户转发历史');
    console.log('   - GET /api/repost/status/:postId - 检查转发状态');
    
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
  setupRepostFeature();
}

module.exports = setupRepostFeature;

