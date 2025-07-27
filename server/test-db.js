const { Post, User } = require('./src/models');

async function testDatabase() {
    try {
        console.log('测试数据库连接...');
        
        // 检查用户表
        const userCount = await User.count();
        console.log(`用户表中有 ${userCount} 条记录`);
        
        if (userCount > 0) {
            const users = await User.findAll({ limit: 3 });
            console.log('前3个用户:', users.map(u => ({ id: u.user_id, username: u.username })));
        }
        
        // 检查帖子表
        const postCount = await Post.count();
        console.log(`帖子表中有 ${postCount} 条记录`);
        
        if (postCount > 0) {
            const posts = await Post.findAll({
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['username', 'nickname']
                }],
                limit: 3
            });
            console.log('前3个帖子:', posts.map(p => ({
                id: p.post_id,
                content: p.content?.substring(0, 50) + '...',
                user: p.user?.username || '未知用户'
            })));
        } else {
            console.log('帖子表为空，创建测试数据...');
            
            // 创建测试用户
            const testUser = await User.create({
                username: 'testuser',
                nickname: '测试用户',
                email: 'test@example.com',
                password: 'password123',
                avatar_url: ''
            });
            
            // 创建测试帖子
            await Post.create({
                user_id: testUser.user_id,
                content: '这是一个测试帖子，用于验证前端显示功能。',
                post_time: new Date(),
                is_deleted: false,
                like_count: 0,
                comment_count: 0,
                repost_count: 0
            });
            
            console.log('测试数据创建成功');
        }
        
    } catch (error) {
        console.error('数据库测试失败:', error);
    }
}

testDatabase(); 