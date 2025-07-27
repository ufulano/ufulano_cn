const { Post, User } = require('./src/models');

async function testPostCreation() {
  try {
    console.log('=== 测试帖子创建和图片显示 ===');

    // 检查用户表
    const userCount = await User.count();
    console.log(`用户表中有 ${userCount} 条记录`);

    if (userCount === 0) {
      console.log('创建测试用户...');
      const testUser = await User.create({
        username: 'testuser',
        nickname: '测试用户',
        email: 'test@example.com',
        password: 'password123',
        avatar_url: ''
      });
      console.log('测试用户创建成功:', testUser.user_id);
    }

    // 获取第一个用户
    const user = await User.findOne();
    console.log('使用用户:', user.username, 'ID:', user.user_id);

    // 检查帖子表
    const postCount = await Post.count();
    console.log(`帖子表中有 ${postCount} 条记录`);

    // 创建测试帖子（带图片）
    const testImages = [
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    ];

    console.log('创建测试帖子...');
    const testPost = await Post.create({
      user_id: user.user_id,
      content: '这是一个测试帖子，包含图片。',
      image_url: JSON.stringify(testImages),
      post_time: new Date(),
      is_deleted: false,
      like_count: 0,
      comment_count: 0,
      repost_count: 0,
      visibility: 0,
      topics: '测试,图片'
    });

    console.log('测试帖子创建成功:', testPost.post_id);

    // 查询并显示帖子
    const posts = await Post.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'nickname', 'avatar_url']
      }],
      order: [['post_time', 'DESC']]
    });

    console.log('\n=== 查询结果 ===');
    posts.forEach(post => {
      console.log(`帖子ID: ${post.post_id}`);
      console.log(`内容: ${post.content}`);
      console.log(`用户: ${post.user?.username || '未知'}`);
      console.log(`图片数据: ${post.image_url ? '存在' : '无'}`);
      
      if (post.image_url) {
        try {
          const images = JSON.parse(post.image_url);
          console.log(`图片数量: ${images.length}`);
          console.log(`图片类型: ${images.map(img => img.split(';')[0].split(':')[1]).join(', ')}`);
        } catch (e) {
          console.log('图片数据解析失败:', e.message);
        }
      }
      console.log('---');
    });

  } catch (error) {
    console.error('测试失败:', error);
  }
}

testPostCreation(); 