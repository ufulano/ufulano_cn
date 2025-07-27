const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Post, User } = require('./src/models');

async function testPostCreation() {
  try {
    console.log('=== 测试Post创建功能 ===');
    
    // 测试数据库连接
    console.log('1. 测试数据库连接...');
    const sequelize = require('./src/config/database');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    // 查找一个用户
    console.log('2. 查找测试用户...');
    const user = await User.findOne();
    if (!user) {
      console.log('没有找到用户，创建测试用户...');
      const testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword'
      });
      console.log('创建测试用户成功:', testUser.user_id);
    } else {
      console.log('找到用户:', user.user_id, user.username);
    }
    
    // 测试创建Post
    console.log('3. 测试创建Post...');
    const testPostData = {
      user_id: user ? user.user_id : 1,
      content: '测试帖子内容',
      image_url: JSON.stringify([]),
      topics: '测试',
      visibility: 0
    };
    
    console.log('准备创建的数据:', testPostData);
    
    const post = await Post.create(testPostData);
    console.log('Post创建成功:', post.toJSON());
    
    // 清理测试数据
    console.log('4. 清理测试数据...');
    await post.destroy();
    console.log('测试完成');
    
  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误堆栈:', error.stack);
  } finally {
    process.exit(0);
  }
}

testPostCreation(); 