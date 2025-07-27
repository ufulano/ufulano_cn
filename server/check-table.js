const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sequelize = require('./src/config/database');

async function checkTable() {
  try {
    console.log('=== 检查表结构 ===');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 检查Posts表结构
    const [results] = await sequelize.query('DESCRIBE Posts');
    console.log('Posts表结构:');
    results.forEach(row => {
      console.log(`字段: ${row.Field}, 类型: ${row.Type}, 允许NULL: ${row.Null}, 默认值: ${row.Default}`);
    });
    
    // 特别检查image_url字段
    const imageUrlField = results.find(row => row.Field === 'image_url');
    if (imageUrlField) {
      console.log('\n=== image_url字段详情 ===');
      console.log(`字段名: ${imageUrlField.Field}`);
      console.log(`类型: ${imageUrlField.Type}`);
      console.log(`字符集: ${imageUrlField.Collation}`);
      console.log(`允许NULL: ${imageUrlField.Null}`);
      console.log(`默认值: ${imageUrlField.Default}`);
      
      if (imageUrlField.Type.includes('TEXT')) {
        console.log('✅ 字段类型是TEXT');
      } else {
        console.log('❌ 字段类型不是TEXT');
      }
    }
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkTable(); 