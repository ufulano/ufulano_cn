document.addEventListener('DOMContentLoaded', function() {
    // 退出登录
    localStorage.removeItem('authToken');
    // 检查toast容器是否存在
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
     showToast('这是一个测试消息', 'success');
    // 表单提交处理
    const loginForm = document.getElementById('mainlogin');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.error('未找到登录表单');
    }

    // 密码可见性切换
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
});

/**
 * 处理登录表单提交
 * @param {Event} e 
 */
async function handleLogin(e) {
    e.preventDefault();
    
    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.querySelector('[name="remember"]').checked;
    
    // 清除之前的错误信息
    document.getElementById('username-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    
    // 验证用户名
    if (!username) {
        document.getElementById('username-error').textContent = '请输入用户名或邮箱';
        return;
    }
    
    // 如果是邮箱，验证格式
    if (username.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            document.getElementById('username-error').textContent = '邮箱格式不正确';
            return;
        }
    }
    
    // 验证密码
    if (!password) {
        document.getElementById('password-error').textContent = '请输入密码';
        return;
    }
    
    if (password.length < 6) {
        document.getElementById('password-error').textContent = '密码长度至少6位';
        return;
    }
    
    // 提交登录
    try {
        // 显示加载状态
        const btn = document.querySelector('.login-btn');
        btn.classList.add('loading');
        
        const response = await fetch('https://ufulano.cn/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, remember })
        });
        
        console.log('发送请求');
        if (!response.ok) {
            console.log('接收到错误请求');
            const errorData = await response.json();
            console.log('登录失败，错误信息:', errorData.message); // 打印错误信息
            showToast(errorData.message || '登录失败，请检查用户名和密码', 'error');
            btn.classList.remove('loading');
            return;
        }

        const data = await response.json();
        
        // 登录成功处理
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // 在登录成功后的回调中添加以下代码
        localStorage.setItem('isLoggedIn', 'true');
        showToast('登录成功', 'success');
        
        // 跳转到之前页面或首页
         setTimeout(() => {
            const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html';
            window.location.href = returnUrl;
        }, 1500);
    } catch (error) {
        console.error('登录错误:', error);
        showToast('网络错误，请重试', 'error');
    } finally {
        document.querySelector('.login-btn').classList.remove('loading');
    }
}

/**
 * 显示Toast通知
 * @param {string} message 
 * @param {string} type 
 */
function showToast(message, type = 'info') {
    // 确保容器存在
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加到容器
    toastContainer.appendChild(toast);
    
    // 显示动画
    setTimeout(() => toast.classList.add('show'), 10);
    
    // 自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}