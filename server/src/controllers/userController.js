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
    
    const { nickname, bio, location, gender, birthday } = req.body;
    const userId = req.user.userId;

    // 更新用户信息
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: '用户不存在'
      });
    }

    // 只更新提供的字段
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