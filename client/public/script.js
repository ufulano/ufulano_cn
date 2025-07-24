/**
 * 应用主脚本
 * 功能包括：用户认证、帖子加载、互动功能等
 */

// 全局状态
const appState = {
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    currentUser: {
        username: localStorage.getItem('username') || '',
        avatar: localStorage.getItem('avatar') || '/images/default-avatar.jpg',
        bio: localStorage.getItem('bio') || '这个人很懒，什么也没留下'
    },
    posts: []
};

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

/**
 * 初始化应用
 */
function initApp() {
    // 检查登录状态并更新UI
    updateAuthUI();
    
    // 设置各种事件监听器
    setupEventListeners();
    
    // 加载帖子
    loadPosts();
}

/**
 * 更新认证相关的UI
 */
function updateAuthUI() {
    const authLinks = document.querySelectorAll('.auth-link');
    const userMenus = document.querySelectorAll('.user-menu');
    const logoutBtn = document.getElementById('logout-btn');
    const userProfile = document.querySelector('.user-profile');

    if (appState.isLoggedIn) {
        // 已登录状态
        authLinks.forEach(link => link.style.display = 'none');
        userMenus.forEach(menu => menu.style.display = 'block');
        
        // 更新用户资料
        if (userProfile) {
            document.querySelector('.profile-avatar img').src = appState.currentUser.avatar;
            document.querySelector('.username').textContent = appState.currentUser.username;
            document.querySelector('.bio').textContent = appState.currentUser.bio;
        }
        
        // 显示登出按钮
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        // 未登录状态
        authLinks.forEach(link => link.style.display = 'block');
        userMenus.forEach(menu => menu.style.display = 'none');
        
        // 隐藏登出按钮
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 登出按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // 发布按钮
    const postButton = document.querySelector('.post-button');
    if (postButton) {
        postButton.addEventListener('click', handlePost);
    }

    // 回车发布
    const postTextarea = document.querySelector('.creator-input textarea');
    if (postTextarea) {
        postTextarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePost();
            }
        });
    }

    // 图片上传
    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }

    // 表情选择器
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiPicker) {
        emojiPicker.addEventListener('click', toggleEmojiPicker);
    }
}

/**
 * 处理登出
 */
function handleLogout() {
    const confirmLogout = window.confirm('您确定要登出吗？');
    if (confirmLogout) {
        // 清除用户数据
        localStorage.clear();
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // 更新应用状态
        appState.isLoggedIn = false;
        appState.currentUser = {
            username: '',
            avatar: '/images/default-avatar.jpg',
            bio: '这个人很懒，什么也没留下'
        };
        window.location.href = '/login.html';
    }
}

/**
 * 加载帖子
 */
async function loadPosts() {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    try {
        postList.innerHTML = '<div class="loading">加载中...</div>';
        
        const response = await fetch('/api/getAllPosts', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('获取帖子失败');
        
        const posts = await response.json();
        appState.posts = posts; // 保存到状态
        
        if (posts.length === 0) {
            postList.innerHTML = '<div class="no-posts">暂无帖子</div>';
            return;
        }
        
        renderPosts(posts);
    } catch (error) {
        console.error('加载帖子失败:', error);
        postList.innerHTML = '<div class="error">加载帖子失败，请刷新重试</div>';
    } finally {
        updateAuthUI(); // 确保UI状态正确
    }
}

/**
 * 渲染帖子列表
 */
function renderPosts(posts) {
    const postList = document.getElementById('post-list');
    if (!postList) return;

    postList.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        postList.appendChild(postElement);
    });
}

/**
 * 创建单个帖子元素
 */
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post-card';
    postElement.dataset.postId = post.id;
    const avatar = JSON.parse(post.avatar);
    
    // 基础HTML结构
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">
                <img src="${avatar}" alt="${post.username}">
            </div>
            <div class="post-user">
                <div class="post-username">${post.username}</div>
                <div class="post-time">${post.time}</div>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
        </div>
        
        <div class="post-footer">
            <div class="post-action" data-action="comment">
                <i class="far fa-comment"></i>
                <span>${post.comments || 0}</span>
            </div>
            <div class="post-action" data-action="repost">
                <i class="fas fa-retweet"></i>
                <span>${post.reposts || 0}</span>
            </div>
            <div class="post-action" data-action="like">
                <i class="far fa-heart"></i>
                <span>${post.likes || 0}</span>
            </div>
            <div class="post-action" data-action="collect">
                <i class="fas fa-bookmark"></i>
            </div>
            <div class="post-action" data-action="share">
                <i class="fas fa-share"></i>
            </div>
        </div>
    `;
    
    // 添加图片（如果有）
    if (post.image) {
        try {
            const images = JSON.parse(post.image);
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'post-images';
            
            images.forEach(base64Image => {
                const img = document.createElement('img');
                img.className = 'post-image';
                img.alt = '文章图片';
                img.src = base64Image;
                imagesContainer.appendChild(img);
            });
            
            postElement.querySelector('.post-content').appendChild(imagesContainer);
        } catch (error) {
            console.error('解析图片数据失败:', error);
        }
    }
    
    // 添加互动事件
    setupPostInteractions(postElement);
    
    return postElement;
}

/**
 * 设置帖子互动事件
 */
function setupPostInteractions(postElement) {
    const postId = postElement.dataset.postId;
    const post = appState.posts.find(p => p.id === postId);
    if (!post) return;
    
    // 点赞
    const likeBtn = postElement.querySelector('[data-action="like"]');
    likeBtn.addEventListener('click', () => {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        
        const icon = likeBtn.querySelector('i');
        icon.classList.toggle('far', !post.isLiked);
        icon.classList.toggle('fas', post.isLiked);
        
        likeBtn.querySelector('span').textContent = post.likes;
    });
    
    // 转发
    const repostBtn = postElement.querySelector('[data-action="repost"]');
    repostBtn.addEventListener('click', () => {
        post.isReposted = !post.isReposted;
        post.reposts += post.isReposted ? 1 : -1;
        repostBtn.querySelector('span').textContent = post.reposts;
    });
    
    // 评论
    const commentBtn = postElement.querySelector('[data-action="comment"]');
    commentBtn.addEventListener('click', () => handleComment(post.postId));
    
    // 收藏
    const collectBtn = postElement.querySelector('[data-action="collect"]');
    collectBtn.addEventListener('click', () => {
        post.isCollected = !post.isCollected;
        collectBtn.querySelector('i').classList.toggle('collected', post.isCollected);
    });
}

/**
 * 处理发布新帖子
 */
async function handlePost() {
    if (!appState.isLoggedIn) {
        alert('请先登录后再发布内容！');
        window.location.href = '/login.html';
        return;
    }

    const postTextarea = document.querySelector('.creator-input textarea');
    const content = postTextarea.value.trim();
    const imageUpload = document.getElementById('image-upload');
    
    if (!content && (!imageUpload || imageUpload.files.length === 0)) {
        showToast('请输入内容或添加图片后再发布！', 'error');
        return;
    }

    const newPost = { content, images: [] };

    try {
        // 处理图片
        if (imageUpload && imageUpload.files.length > 0) {
            for (let i = 0; i < imageUpload.files.length; i++) {
                const compressedFile = await compressImage(imageUpload.files[i], {
                    quality: 0.7,
                    maxWidth: 800,
                    maxHeight: 800
                });
                const base64Image = await fileToBase64(compressedFile);
                newPost.images.push(base64Image);
            }
        }

        // 发送请求
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('用户未认证，请重新登录');

        const response = await fetch('/api/createPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newPost)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '发布失败');
        }

        // 成功处理
        postTextarea.value = '';
        if (imageUpload) imageUpload.value = '';
        document.getElementById('image-preview').innerHTML = '';
        
        showToast('发布成功！', 'success');
        loadPosts(); // 刷新列表
    } catch (error) {
        console.error('发布失败:', error);
        showToast(`发布失败: ${error.message}`, 'error');
    }
}

/**
 * 处理图片上传
 */
async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const imagePreview = document.getElementById('image-preview');
    if (!imagePreview) return;

    try {
        const compressedFile = await compressImage(file, {
            quality: 0.7,
            maxWidth: 800,
            maxHeight: 800
        });
        
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.innerHTML = `
                <img src="${event.target.result}" alt="预览图片" style="max-width: 100%; height: auto;">
                <button class="remove-image" title="移除图片">×</button>
            `;
            imagePreview.style.display = 'block';
            
            // 添加移除按钮事件
            imagePreview.querySelector('.remove-image').addEventListener('click', () => {
                imagePreview.innerHTML = '';
                imagePreview.style.display = 'none';
                document.getElementById('image-upload').value = '';
            });
        };
        reader.readAsDataURL(compressedFile);
    } catch (error) {
        showToast('图片处理失败: ' + error.message, 'error');
        console.error('图片压缩错误:', error);
    }
}

/**
 * 图片压缩函数
 */
function compressImage(file, options = { quality: 0.7, maxWidth: 800, maxHeight: 800 }) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = new Image();
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 计算新尺寸
                let { width, height } = img;
                
                if (width > options.maxWidth) {
                    height *= options.maxWidth / width;
                    width = options.maxWidth;
                }
                
                if (height > options.maxHeight) {
                    width *= options.maxHeight / height;
                    height = options.maxHeight;
                }
                
                // 设置canvas并绘制
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为Blob
                canvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob转换失败'));
                        return;
                    }
                    
                    const fileName = file.name.replace(/\.[^/.]+$/, '.jpg');
                    resolve(new File([blob], fileName, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', options.quality);
            };
            
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = event.target.result;
        };
        
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

/**
 * 文件转Base64
 */
function fileToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

/**
 * 显示Toast通知
 */
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 切换表情选择器
 */
function toggleEmojiPicker() {
    const emojiContainer = document.getElementById('emoji-container');
    if (!emojiContainer) return;
    
    emojiContainer.style.display = emojiContainer.style.display === 'none' ? 'block' : 'none';
}

/**
 * 处理评论
 */
function handleComment(postId) {
    const post = appState.posts.find(p => p.id === postId);
    if (!post) return;

    console.log('准备显示评论框'); // 调试语句，检查函数是否被调用

    const commentBox = document.createElement('div');
    commentBox.className = 'comment-box';
    commentBox.innerHTML = `
        <div class="comment-header">
            <span>评论</span>
            <i class="fas fa-times close-comment-box"></i>
        </div>
        <textarea placeholder="写下你的评论..."></textarea>
        <button class="comment-button">评论</button>
    `;

    document.body.appendChild(commentBox);
    console.log('评论框已添加到页面'); // 调试语句，检查元素是否插入到页面

    // 关闭按钮
    commentBox.querySelector('.close-comment-box').addEventListener('click', () => {
        document.body.removeChild(commentBox);
    });

    // 评论按钮
    commentBox.querySelector('.comment-button').addEventListener('click', () => {
        const commentText = commentBox.querySelector('textarea').value.trim();
        if (commentText) {
            post.comments++;
            showToast('评论成功！', 'success');
            document.body.removeChild(commentBox);
            loadPosts(); // 刷新列表
        } else {
            showToast('评论内容不能为空！', 'error');
        }
    });
}
