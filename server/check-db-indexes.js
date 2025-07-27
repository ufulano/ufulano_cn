const mysql = require('mysql2/promise')
require('dotenv').config()

async function checkAndFixIndexes() {
  let connection
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ufulano_cn',
      charset: 'utf8mb4'
    })
    
    console.log('数据库连接成功')
    
    // 检查所有表的索引数量
    const [tables] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COUNT(*) as index_count
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ?
      GROUP BY TABLE_NAME
      ORDER BY index_count DESC
    `, [process.env.DB_NAME || 'ufulano_cn'])
    
    console.log('=== 各表索引数量 ===')
    tables.forEach(table => {
      console.log(`${table.TABLE_NAME}: ${table.index_count} 个索引`)
    })
    
    // 检查Users表的详细索引信息
    console.log('\n=== Users表索引详情 ===')
    const [userIndexes] = await connection.execute(`
      SELECT 
        INDEX_NAME,
        COLUMN_NAME,
        NON_UNIQUE,
        SEQ_IN_INDEX
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Users'
      ORDER BY INDEX_NAME, SEQ_IN_INDEX
    `, [process.env.DB_NAME || 'ufulano_cn'])
    
    userIndexes.forEach(index => {
      console.log(`索引: ${index.INDEX_NAME}, 列: ${index.COLUMN_NAME}, 唯一: ${!index.NON_UNIQUE}`)
    })
    
    // 检查是否有重复的索引
    const duplicateIndexes = userIndexes.filter((index, i, arr) => 
      arr.findIndex(item => item.INDEX_NAME === index.INDEX_NAME) !== i
    )
    
    if (duplicateIndexes.length > 0) {
      console.log('\n发现重复索引:', duplicateIndexes)
    }
    
    // 如果索引数量超过60，建议清理一些不必要的索引
    const userTableIndexCount = userIndexes.length
    if (userTableIndexCount > 60) {
      console.log(`\n警告: Users表有 ${userTableIndexCount} 个索引，接近MySQL限制(64)`)
      console.log('建议清理一些不必要的索引')
      
      // 尝试删除一些可能重复的索引
      const indexesToRemove = [
        'email_2',
        'username_2', 
        'email_3',
        'username_3'
      ]
      
      for (const indexName of indexesToRemove) {
        try {
          await connection.execute(`DROP INDEX ${indexName} ON Users`)
          console.log(`已删除索引: ${indexName}`)
        } catch (error) {
          if (error.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log(`删除索引 ${indexName} 失败:`, error.message)
          }
        }
      }
    }
    
    // 尝试修复email字段的UNIQUE约束
    console.log('\n=== 尝试修复email字段 ===')
    try {
      // 先检查email字段是否已经有UNIQUE约束
      const [emailConstraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Users' AND CONSTRAINT_TYPE = 'UNIQUE'
      `, [process.env.DB_NAME || 'ufulano_cn'])
      
      console.log('当前UNIQUE约束:', emailConstraints)
      
      // 如果email字段没有UNIQUE约束，尝试添加
      const hasEmailUnique = emailConstraints.some(constraint => 
        constraint.CONSTRAINT_NAME.includes('email')
      )
      
      if (!hasEmailUnique) {
        console.log('添加email字段的UNIQUE约束...')
        await connection.execute(`
          ALTER TABLE Users ADD UNIQUE KEY email_unique (email)
        `)
        console.log('email字段UNIQUE约束添加成功')
      } else {
        console.log('email字段已有UNIQUE约束')
      }
      
    } catch (error) {
      console.error('修复email字段失败:', error.message)
      
      if (error.code === 'ER_TOO_MANY_KEYS') {
        console.log('\n=== 解决方案 ===')
        console.log('1. 手动删除一些不必要的索引:')
        console.log('   DROP INDEX index_name ON Users;')
        console.log('2. 或者重新创建表结构')
        console.log('3. 或者使用以下命令添加email唯一约束:')
        console.log('   ALTER TABLE Users ADD UNIQUE KEY email_unique (email);')
      }
    }
    
  } catch (error) {
    console.error('数据库操作失败:', error)
  } finally {
    if (connection) {
      await connection.end()
      console.log('\n数据库连接已关闭')
    }
  }
}

// 运行检查
checkAndFixIndexes().then(() => {
  console.log('检查完成')
  process.exit(0)
}).catch(error => {
  console.error('检查失败:', error)
  process.exit(1)
}) 