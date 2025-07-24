const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Post, User } = require('../models');

exports.getAllPosts = async (req, res) => {
    try {
        console.info('获取文章请求已到达 postController.js');

        // 查询所有未删除的帖子
        const posts = await Post.findAll({
            where: { is_deleted: false },
            include: [
                {
                    model: User,
                    as: 'user', // 统一别名
                    attributes: ['username', 'avatar_url']
                }
            ],
            order: [['post_time', 'DESC']]
        });

        // 转换数据结构
        const formattedPosts = posts.map(post => ({
            id: post.post_id,
            username: post.user.username,  // 统一访问方式
            avatar: post.user.avatar_url,
            time: formatPostTime(post.post_time),
            content: post.content,
            image: post.image_url,
            comments: post.comment_count,
            reposts: post.repost_count,
            likes: post.like_count
        }));

        res.json(formattedPosts);
    } catch (err) {
        console.error('获取文章失败:', err);
        res.status(500).json({ 
            message: '获取文章失败',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

exports.createPost = async (req, res) => {
    try {
        console.info('发布推文请求已到达 postController.js');
        console.info('请求体内容:', req.body);
        console.info('当前用户信息:', req.user);

        const { content, images, topics, visibility } = req.body;
        const userId = req.user.userId;

        if (!content) {
            console.warn('内容为空，无法发布推文');
            return res.status(400).json({ message: '内容不能为空' });
        }

        console.info('验证通过，准备创建新帖子');

        // 处理 visibility（字符串转数字）
        const visibilityMap = {
            'public': 0,
            'follower': 1,
            'private': 2
        };
        const visibilityValue = visibilityMap[visibility] ?? 0; // 默认公开

        // 处理 topics
        const topicsString = topics ? 
            (Array.isArray(topics) ? topics.join(',') : String(topics)) 
            : '';

            // 验证 Base64 数据是否有效（可选）
        function isValidBase64Image(base64Image) {
            if (!base64Image) return false;
            const base64Regex = /^data:image\/(jpeg|png|gif|bmp);base64,/;
            return base64Regex.test(base64Image);
        }
    
        // 验证所有图片数据是否有效
        for (const image of images) {
            if (!isValidBase64Image(image)) {
                return res.status(400).json({ error: '无效的图片数据' });
            }
        }
            
        
                // 创建新帖子（添加调试日志）
        console.log('准备创建的帖子数据:', {
          user_id: userId,
          content,
          image_url: JSON.stringify(images), // 重点检查这个值
          topics: topicsString,
          visibility: visibilityValue
        });


        // 创建新帖子
        const post = await Post.create({
            user_id: userId,
            content,
            image_url: JSON.stringify(images),
            topics: topicsString,
            visibility: visibilityValue, // 使用转换后的数字值
            // 其他字段会自动填充默认值
        });

        console.info('帖子创建成功:', post.toJSON());
        console.log('创建后的帖子数据:', post.toJSON());
        res.status(201).json(post);
    } catch (err) {
        console.error('创建帖子时发生错误:', err);
        res.status(500).json({ 
            message: '创建文章失败',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};