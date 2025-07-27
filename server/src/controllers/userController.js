const User = require('../models/User');

// 更新用户头像
exports.updateUserAvatar = async (req, res) => {
  try {
    console.log('=== 更新用户头像请求 ===');
    console.log('用户ID:', req.user.userId);
    console.log('请求体:', req.body);
    
    const { avatar_url } = req.body;
    const userId = req.user.userId;

    if (!avatar_url) {
      return res.status(400).json({
        message: '头像数据不能为空'
      });
    }

    // 验证base64格式
    if (!avatar_url.startsWith('data:image/')) {
      return res.status(400).json({
        message: '头像格式不正确'
      });
    }

    // 更新用户头像
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: '用户不存在'
      });
    }

    user.avatar_url = avatar_url;
    await user.save();

    console.log('头像更新成功');

    res.json({
      message: '头像更新成功',
      avatar_url: user.avatar_url
    });
  } catch (error) {
    console.error('更新头像失败:', error);
    res.status(500).json({
      message: '更新头像失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新用户信息
exports.updateUserProfile = async (req, res) => {
  try {
    console.log('=== 更新用户信息请求 ===');
    console.log('用户ID:', req.user.userId);
    console.log('请求体:', req.body);
    
    const { username, nickname, bio, location, gender, birthday } = req.body;
    const userId = req.user.userId;

    // 更新用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: '用户不存在'
      });
    }

    // 检查用户名是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({
          message: '用户名已被使用'
        });
      }
    }

    // 只更新提供的字段
    if (username !== undefined) user.username = username;
    if (nickname !== undefined) user.nickname = nickname;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (gender !== undefined) user.gender = gender;
    if (birthday !== undefined) user.birthday = birthday;

    await user.save();

    console.log('用户信息更新成功');

    res.json({
      message: '用户信息更新成功',
      user: {
        user_id: user.user_id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        birthday: user.birthday
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      message: '更新用户信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取用户信息
exports.getUserInfo = async (req, res) => {
  try {
    console.log('=== 获取用户信息请求 ===');
    console.log('用户ID:', req.params.userId);
    
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: '无效的用户ID'
      });
    }

    const user = await User.findByPk(parseInt(userId));
    if (!user) {
      return res.status(404).json({
        message: '用户不存在'
      });
    }

    console.log('用户信息获取成功');

    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        birthday: user.birthday,
        create_time: user.create_time
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      message: '获取用户信息失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取用户帖子
exports.getUserPosts = async (req, res) => {
  try {
    console.log('=== 获取用户帖子请求 ===');
    console.log('用户ID:', req.params.userId);
    
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        message: '无效的用户ID'
      });
    }

    const { Post } = require('../models');

    const posts = await Post.findAll({
      where: { 
        user_id: parseInt(userId),
        is_deleted: false 
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'nickname', 'avatar_url']
        }
      ],
      order: [['post_time', 'DESC']],
      limit,
      offset
    });

    const total = await Post.count({
      where: { 
        user_id: parseInt(userId),
        is_deleted: false 
      }
    });

    // 格式化帖子数据
    const formattedPosts = posts.map(post => ({
      id: post.post_id,
      username: post.user?.username || '未知用户',
      nickname: post.user?.nickname || '',
      avatar: post.user?.avatar_url || '',
      time: formatPostTime(post.post_time),
      content: post.content || '',
      images: post.image_url ? (() => {
        try {
          return JSON.parse(post.image_url);
        } catch (e) {
          console.warn('解析图片数据失败:', e);
          return [];
        }
      })() : [],
      comments: post.comment_count || 0,
      reposts: post.repost_count || 0,
      likes: post.like_count || 0,
      createdAt: post.post_time
    }));

    console.log('用户帖子获取成功:', formattedPosts.length, '条');

    res.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取用户帖子失败:', error);
    res.status(500).json({
      message: '获取用户帖子失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 时间格式化辅助函数
function formatPostTime(date) {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now - postDate) / 1000);
  
  if (diffInSeconds < 60) return '刚刚';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`;
  
  return postDate.toLocaleDateString();
} 