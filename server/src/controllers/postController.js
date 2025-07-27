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
                    attributes: ['username', 'nickname', 'avatar_url']
                }
            ],
            order: [['post_time', 'DESC']]
        });

        console.info(`查询到 ${posts.length} 条帖子`);

        // 转换数据结构
        const formattedPosts = posts.map(post => {
            console.info('处理帖子:', post.post_id, '用户:', post.user?.username, '头像:', post.user?.avatar_url ? '存在' : '不存在');
            return {
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
            };
        });

        console.info('返回格式化后的帖子数据:', formattedPosts.length, '条');
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
        const userId = parseInt(req.user.userId, 10); // 确保是数字类型
        
        console.log('=== 用户信息调试 ===');
        console.log('req.user:', req.user);
        console.log('userId:', userId);
        console.log('userId类型:', typeof userId);

        // 验证用户是否存在
        if (!userId) {
            console.error('用户ID为空');
            return res.status(400).json({ message: '用户ID无效' });
        }

        // 检查用户是否存在于数据库中
        try {
            const userExists = await User.findByPk(userId);
            if (!userExists) {
                console.error('用户不存在，ID:', userId);
                return res.status(400).json({ message: '用户不存在' });
            }
            console.log('用户验证成功:', userExists.username);
        } catch (userError) {
            console.error('验证用户时出错:', userError);
            return res.status(500).json({ message: '用户验证失败' });
        }

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

            // 验证 Base64 数据是否有效
        function isValidBase64Image(base64Image) {
            if (!base64Image) return false;
            const base64Regex = /^data:image\/(jpeg|png|gif|bmp);base64,/;
            return base64Regex.test(base64Image);
        }

        // 验证图片大小（限制为10MB）
        function validateImageSize(base64Image) {
            const base64Data = base64Image.split(',')[1];
            const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
            const sizeInMB = sizeInBytes / (1024 * 1024);
            return sizeInMB <= 10; // 限制10MB
        }

        // 验证图片格式
        function validateImageFormat(base64Image) {
            const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            const format = base64Image.match(/data:(image\/[^;]+)/);
            return format && allowedFormats.includes(format[1]);
        }
    
        // 验证所有图片数据
        if (images && images.length > 0) {
            console.info(`验证 ${images.length} 张图片`);
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                
                if (!isValidBase64Image(image)) {
                    console.error(`第${i + 1}张图片格式无效:`, image.substring(0, 50) + '...');
                    return res.status(400).json({ 
                        error: `第${i + 1}张图片格式无效` 
                    });
                }
                
                if (!validateImageSize(image)) {
                    console.error(`第${i + 1}张图片大小超过限制`);
                    return res.status(400).json({ 
                        error: `第${i + 1}张图片大小不能超过10MB` 
                    });
                }
                
                if (!validateImageFormat(image)) {
                    console.error(`第${i + 1}张图片格式不支持`);
                    return res.status(400).json({ 
                        error: `第${i + 1}张图片格式不支持，只支持JPG、PNG、GIF格式` 
                    });
                }
            }
        } else {
            console.info('没有图片需要验证');
        }
            
        
                // 创建新帖子（添加调试日志）
        // 清理和验证数据
        const cleanContent = content ? content.trim() : '';
        const cleanImages = images && images.length > 0 ? images : [];
        const cleanImageUrl = JSON.stringify(cleanImages);
        
        // 检查数据长度 (LONGTEXT最大4GB，但为了性能限制在10MB)
        if (cleanImageUrl.length > 10 * 1024 * 1024) { // 10MB限制
            console.error('图片数据过长:', cleanImageUrl.length);
            return res.status(400).json({ message: '图片数据过长，请减少图片数量或压缩图片' });
        }
        
        const postData = {
          user_id: userId,
          content: cleanContent,
          image_url: cleanImageUrl,
          topics: topicsString,
          visibility: visibilityValue
        };
        
        console.log('准备创建的帖子数据:', postData);
        console.log('用户ID类型:', typeof userId, '值:', userId);
        console.log('图片数据长度:', images ? images.length : 0);
        console.log('image_url内容:', JSON.stringify(images));
        console.log('content长度:', content ? content.length : 0);
        console.log('topicsString:', topicsString);
        console.log('visibilityValue:', visibilityValue);

        // 创建新帖子
        try {
            const post = await Post.create(postData);
            console.info('帖子创建成功:', post.toJSON());
            console.log('创建后的帖子数据:', post.toJSON());
            res.status(201).json(post);
        } catch (createError) {
            console.error('Post.create() 失败:', createError);
            console.error('创建错误详情:', createError.message);
            console.error('尝试创建的数据:', postData);
            
            // 检查是否是外键约束错误
            if (createError.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({
                    message: '用户不存在',
                    error: '用户ID无效'
                });
            }
            
            // 检查是否是数据类型错误
            if (createError.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    message: '数据格式错误',
                    error: createError.message
                });
            }
            
            throw createError; // 重新抛出错误，让外层catch处理
        }

        console.info('帖子创建成功:', post.toJSON());
        console.log('创建后的帖子数据:', post.toJSON());
        res.status(201).json(post);
    } catch (err) {
        console.error('创建帖子时发生错误:', err);
        console.error('错误堆栈:', err.stack);
        console.error('请求体:', req.body);
        console.error('用户信息:', req.user);
        
        res.status(500).json({ 
            message: '创建文章失败',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};