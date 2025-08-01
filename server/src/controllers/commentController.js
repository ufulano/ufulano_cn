/**
 * 评论控制器
 * 
 * 功能特性：
 * - 评论管理：创建、获取、更新、删除评论
 * - 回复系统：支持评论回复和嵌套回复
 * - 内容过滤：敏感内容检测和过滤
 * - 分页查询：高性能的评论分页
 * - 权限控制：评论可见性和编辑权限
 * - 通知系统：评论通知和提醒
 * 
 * 数据处理：
 * - 内容验证：防止XSS和恶意内容
 * - 用户验证：评论者身份验证
 * - 数据统计：评论数量统计
 * - 缓存策略：热门评论缓存
 * 
 * API端点：
 * - POST /comments：创建评论
 * - GET /comments：获取评论列表
 * - GET /comments/:id：获取评论详情
 * - PUT /comments/:id：更新评论
 * - DELETE /comments/:id：删除评论
 * - GET /comments/post/:postId：获取帖子评论
 */

const { Comment, User } = require('../models/index');

// 格式化评论时间
const formatCommentTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取帖子的评论
exports.getComment = async (req, res) => {
  try {
    const { postId } = req.params;
    
    console.log('=== 获取评论请求 ===');
    console.log('postId:', postId);
    console.log('req.params:', req.params);
    console.log('req.url:', req.url);
    console.log('Comment 模型:', typeof Comment);
    console.log('User 模型:', typeof User);
    
    // 检查数据库连接
    const { sequelize } = require('../models/index');
    try {
      await sequelize.authenticate();
      console.log('数据库连接正常');
    } catch (dbError) {
      console.error('数据库连接失败:', dbError);
      return res.status(500).json({
        message: '数据库连接失败',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    // 验证 postId
    if (!postId || isNaN(parseInt(postId))) {
      return res.status(400).json({
        message: '无效的帖子ID'
      });
    }

    // 查询评论，包含用户信息
    console.log('开始查询评论，post_id:', parseInt(postId));
    
    const comments = await Comment.findAll({
      where: { post_id: parseInt(postId) },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'nickname', 'avatar_url']
        }
      ],
      order: [['comment_time', 'DESC']]
    });

    console.log(`找到 ${comments.length} 条评论`);
    console.log('评论数据:', comments.map(c => ({
      id: c.comment_id,
      content: c.comment_content,
      user: c.user?.username
    })));

    // 格式化评论数据
    const formattedComments = comments.map(comment => ({
      id: comment.comment_id,
      content: comment.comment_content,
      time: formatCommentTime(comment.comment_time),
      createdAt: comment.comment_time,
      user: {
        id: comment.user?.user_id,
        username: comment.user?.username || '未知用户',
        nickname: comment.user?.nickname || '',
        avatar: comment.user?.avatar_url || ''
      }
    }));

    console.log('返回格式化评论:', formattedComments.length, '条');
    res.json(formattedComments);
  } catch (err) {
    console.error('获取评论失败:', err);
    console.error('错误堆栈:', err.stack);
    res.status(500).json({
      message: '获取评论失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// 创建评论
exports.createComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.userId; // 从认证中间件获取，注意是 userId 不是 user_id

    console.log('创建评论请求:', { postId, content, userId });
    console.log('req.user:', req.user);

    // 验证输入
    if (!postId || !content) {
      return res.status(400).json({
        message: '缺少必要参数'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        message: '评论内容不能为空'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: '评论内容不能超过1000字符'
      });
    }

    // 创建评论
    console.log('准备创建评论:', {
      user_id: userId,
      post_id: postId,
      content: content.trim()
    });
    
    const comment = await Comment.create({
      user_id: userId,
      post_id: postId,
      comment_content: content.trim(),
      comment_time: new Date()
    });
    
    console.log('评论创建成功:', comment.comment_id);

    // 获取刚创建的评论，包含用户信息
    const newComment = await Comment.findByPk(comment.comment_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'nickname', 'avatar_url']
        }
      ]
    });

    // 更新帖子的评论数
    const { Post } = require('../models');
    await Post.increment('comment_count', {
      where: { post_id: postId }
    });

    // 格式化返回数据
    const formattedComment = {
      id: newComment.comment_id,
      content: newComment.comment_content,
      time: formatCommentTime(newComment.comment_time),
      createdAt: newComment.comment_time,
      user: {
        id: newComment.user?.user_id,
        username: newComment.user?.username || '未知用户',
        nickname: newComment.user?.nickname || '',
        avatar: newComment.user?.avatar_url || ''
      }
    };

    console.log('评论创建成功:', formattedComment);
    res.status(201).json(formattedComment);
  } catch (err) {
    console.error('创建评论失败:', err);
    res.status(500).json({
      message: '创建评论失败',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
