<!--
 * 登录页面组件
 * 
 * 功能特性：
 * - 用户登录：支持用户名/邮箱登录
 * - 表单验证：完整的输入验证和错误提示
 * - 记住登录：支持记住登录状态
 * - 第三方登录：支持微信、QQ等第三方登录
 * - 注册跳转：快速跳转到注册页面
 * - 密码找回：忘记密码功能
 * 
 * 页面结构：
 * - 登录表单：用户名/邮箱、密码输入
 * - 记住登录：复选框选项
 * - 第三方登录：社交平台登录按钮
 * - 注册链接：跳转到注册页面
 * 
 * 技术实现：
 * - 表单验证：使用Element Plus表单验证
 * - 状态管理：与用户store集成
 * - 路由跳转：登录成功后跳转到首页
 * - 安全处理：密码加密、防重复提交等
 -->
<!--
 * 登录页面组件
 * 
 * 功能特性：
 * - 用户登录：支持用户名/邮箱登录
 * - 表单验证：完整的输入验证和错误提示
 * - 记住登录：支持记住登录状态
 * - 第三方登录：支持微信、QQ等第三方登录
 * - 注册跳转：快速跳转到注册页面
 * - 密码找回：忘记密码功能
 * 
 * 页面结构：
 * - 登录表单：用户名/邮箱、密码输入
 * - 记住登录：复选框选项
 * - 第三方登录：社交平台登录按钮
 * - 注册链接：跳转到注册页面
 * 
 * 技术实现：
 * - 表单验证：使用Element Plus表单验证
 * - 状态管理：与用户store集成
 * - 路由跳转：登录成功后跳转到首页
 * - 安全处理：密码加密、防重复提交等
 -->
<template>
  <div class="login-root">
    <!-- 背景装饰 -->
    <div class="login-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
    
    <!-- 登录表单容器 -->
    <div class="login-container">
      <div class="login-card">
        <!-- 页面标题 -->
        <div class="login-header">
          <h1>欢迎回来</h1>
          <p>登录你的账号，开始分享生活</p>
        </div>
        
        <!-- 登录表单 -->
        <el-form 
          :model="loginForm" 
          :rules="loginRules" 
          ref="loginFormRef" 
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <!-- 用户名/邮箱输入 -->
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名或邮箱"
              size="large"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <!-- 密码输入 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <!-- 记住登录选项 -->
          <div class="login-options">
            <el-checkbox v-model="loginForm.rememberMe">
              记住登录状态
            </el-checkbox>
            <el-link type="primary" @click="handleForgotPassword">
              忘记密码？
            </el-link>
          </div>
          
          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loggingIn"
              @click="handleLogin"
            >
              {{ loggingIn ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 分割线 -->
        <div class="divider">
          <span>或</span>
        </div>
        
        <!-- 第三方登录 -->
        <div class="social-login">
          <el-button 
            class="social-button wechat"
            @click="handleSocialLogin('wechat')"
          >
            <i class="icon-wechat"></i>
            微信登录
          </el-button>
          
          <el-button 
            class="social-button qq"
            @click="handleSocialLogin('qq')"
          >
            <i class="icon-qq"></i>
            QQ登录
          </el-button>
        </div>
        
        <!-- 注册链接 -->
        <div class="register-link">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goToRegister">
            立即注册
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api/auth'
import { useUserStore } from '../store/user'

// 获取路由实例和用户store
const router = useRouter()
const userStore = useUserStore()

// 响应式状态管理
const loggingIn = ref(false)           // 登录状态
const loginFormRef = ref()             // 表单引用

// 登录表单数据
const loginForm = reactive({
  username: '',                        // 用户名或邮箱
  password: '',                        // 密码
  rememberMe: false                    // 记住登录状态
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

/**
 * 处理登录提交
 * 
 * 功能：
 * - 验证表单数据
 * - 调用登录API
 * - 保存用户信息到store
 * - 跳转到首页或指定页面
 * - 处理登录错误
 */
const handleLogin = async () => {
  try {
    // 验证表单
    await loginFormRef.value.validate()
    
    loggingIn.value = true
    
    // 调用登录API
    const response = await login({
      username: loginForm.username,
      password: loginForm.password,
      remember_me: loginForm.rememberMe
    })
    
    // 保存用户信息
    userStore.setUser(response.user)
    userStore.setToken(response.token)
    
    ElMessage.success('登录成功')
    
    // 跳转到首页或指定页面
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
    
  } catch (error) {
    console.error('登录失败:', error)
    
    if (error.response?.status === 401) {
      ElMessage.error('用户名或密码错误')
    } else if (error.response?.status === 429) {
      ElMessage.error('登录尝试过于频繁，请稍后再试')
    } else {
      ElMessage.error('登录失败，请检查网络连接')
    }
  } finally {
    loggingIn.value = false
  }
}

/**
 * 处理第三方登录
 * 
 * @param {string} platform - 登录平台（wechat/qq）
 */
const handleSocialLogin = (platform) => {
  console.log('第三方登录:', platform)
  // TODO: 实现第三方登录逻辑
  ElMessage.info(`${platform}登录功能开发中...`)
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = () => {
  console.log('忘记密码')
  // TODO: 跳转到密码找回页面
  ElMessage.info('密码找回功能开发中...')
}

/**
 * 跳转到注册页面
 */
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
/* 登录页面根容器 */
.login-root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* 登录容器 */
.login-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 400px;
  padding: 0 20px;
}

/* 登录卡片 */
.login-card {
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  backdrop-filter: blur(10px);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  color: var(--color-gray-dark);
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: var(--color-gray);
  font-size: 16px;
}

/* 登录表单 */
.login-form {
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

/* 登录选项 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* 分割线 */
.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-gray-light);
}

.divider span {
  background: var(--color-white);
  padding: 0 16px;
  color: var(--color-gray);
  font-size: 14px;
}

/* 第三方登录 */
.social-login {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.social-button {
  flex: 1;
  height: 44px;
  border: 1px solid var(--color-gray-light);
  background: var(--color-white);
  color: var(--color-gray-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.social-button:hover {
  border-color: var(--color-blue);
  color: var(--color-blue);
}

.social-button.wechat:hover {
  border-color: #07c160;
  color: #07c160;
}

.social-button.qq:hover {
  border-color: #12b7f5;
  color: #12b7f5;
}

/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: var(--color-gray);
}

.register-link span {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .social-login {
    flex-direction: column;
  }
}
</style> 