const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sequelize = require('./src/config/database');

async function updateDatabase() {
  try {
    console.log('=== 更新数据库表结构 ===');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 执行SQL修改
    const sql = `
      ALTER TABLE Posts 
      MODIFY COLUMN image_url LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
    `;
    
    await sequelize.query(sql);
    console.log('成功修改image_url字段为LONGTEXT类型');
    
    // 验证修改
    const [results] = await sequelize.query('DESCRIBE Posts');
    console.log('表结构验证:');
    results.forEach(row => {
      if (row.Field === 'image_url') {
        console.log(`字段: ${row.Field}, 类型: ${row.Type}, 字符集: ${row.Collation}`);
      }
    });
    
    console.log('数据库更新完成');
    
  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateDatabase(); 