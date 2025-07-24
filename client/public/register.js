document.addEventListener('DOMContentLoaded', function() {


    // 检查toast容器是否存在
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // 显示测试消息
    showToast('这是一个测试消息', 'success');

    // 表单提交处理
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    } else {
        console.error('未找到注册表单');
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
 * 处理注册表单提交
 * @param {Event} e 
 */
async function handleRegister(e) {
    e.preventDefault();
    
    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 清除之前的错误信息
    document.getElementById('username-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    
    // 验证用户名
    if (!username) {
        document.getElementById('username-error').textContent = '请输入用户名';
        return;
    }
    
    // 验证邮箱
    if (!email) {
        document.getElementById('email-error').textContent = '请输入邮箱';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('email-error').textContent = '邮箱格式不正确';
        return;
    }

    // 验证密码
    if (!password || !confirmPassword) {
        document.getElementById('password-error').textContent = '请输入密码及确认密码';
        return;
    }

    if (password !== confirmPassword) {
        document.getElementById('password-error').textContent = '两次输入的密码不一致';
        return;
    }

    if (password.length < 6) {
        document.getElementById('password-error').textContent = '密码长度至少6位';
        return;
    }
    
    console.log('发送请求');
    // 提交注册
    try {
        const response = await fetch('https://ufulano.cn/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        
        if (!response.ok) {
            const errorData = await response.json();
            showToast(errorData.message || '注册失败，请检查输入信息', 'error');
            btn.classList.remove('loading');
            return;
        }

        const data = await response.json();
        
        // 注册成功处理
        showToast('注册成功，请登录', 'success');
        
        // 跳转到登录页面
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
    } catch (error) {
        console.error('注册错误:', error);
        showToast('网络错误，请稍后再试', 'error');
    } finally {
        document.querySelector('.register-btn').classList.remove('loading');
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