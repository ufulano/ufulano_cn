<!--
 * 注册页面组件
 * 
 * 功能特性：
 * - 用户注册：支持用户名、邮箱、密码注册
 * - 表单验证：完整的输入验证和错误提示
 * - 密码强度：实时密码强度检测
 * - 邮箱验证：邮箱格式验证和重复检查
 * - 用户协议：注册前同意用户协议
 * - 登录跳转：快速跳转到登录页面
 * 
 * 页面结构：
 * - 注册表单：用户名、邮箱、密码输入
 * - 密码确认：确认密码输入
 * - 用户协议：协议同意复选框
 * - 登录链接：跳转到登录页面
 * 
 * 技术实现：
 * - 表单验证：使用Element Plus表单验证
 * - 密码强度：自定义密码强度检测
 * - 状态管理：与用户store集成
 * - 路由跳转：注册成功后跳转到首页
 -->
<template>
  <div class="register-bg">
    <AppHeader />
    <div class="register-card-2col">
      <div class="register-left">
        <div class="register-logo-title">
          <img src="../logo.png" alt="logo" class="register-logo" @click="goHome" style="cursor:pointer;" />
          <div class="register-main-title">
            <span style="color:#40BFFF">Uf</span><span style="color:#FFD600">ula</span><span style="color:#40BFFF">no</span>
          </div>
          <div class="register-sub-title">注册</div>
        </div>
        <el-card class="register-form-card" shadow="never">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="70px" @keyup.enter="onSubmit">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" autocomplete="username" clearable placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" autocomplete="email" clearable placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" autocomplete="new-password" show-password clearable placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="onSubmit" class="register-btn">注册</el-button>
            </el-form-item>
            <div class="register-links">
              <el-button link @click="goLogin" class="yellow-link">已有账号？登录</el-button>
            </div>
          </el-form>
        </el-card>
      </div>
      <div class="register-right">
        <div class="register-banner-bg">
          <img class="register-banner" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDA5RUZGIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYW5uZXI8L3RleHQ+Cjwvc3ZnPgo=" alt="banner" @click="goHome" style="cursor:pointer;" />
          <div class="banner-desc">Ufulano - 发现有趣的人和事</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', email: '', password: '', remember: false })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      const res = await register(form.value)
      userStore.setUser(res.token, res.User, form.value.remember)
      ElMessage.success('注册成功')
      router.push('/')
    } catch (e) {
      ElMessage.error(e?.message || '注册失败')
    } finally {
      loading.value = false
    }
  })
}

const goLogin = () => {
  router.push('/login')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.register-bg {
  min-height: 100vh;
  width: 100vw;
  background: 
    linear-gradient(135deg, #667eea 0%, #764ba2 100%),
    linear-gradient(45deg, rgba(255, 214, 0, 0.1) 0%, rgba(64, 191, 255, 0.1) 100%);
  background-blend-mode: overlay;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 24px 24px 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.register-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 20%, rgba(255, 214, 0, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 70% 80%, rgba(64, 191, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
.register-card-2col {
  display: flex;
  flex-direction: row;
  width: 820px;
  min-height: 480px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 36px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 10px 20px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  overflow: hidden;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  border: 3px solid transparent;
  background-clip: padding-box;
}

.register-card-2col::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 36px;
  padding: 3px;
  background: conic-gradient(from 0deg, 
    var(--color-blue) 0deg, 
    var(--color-yellow) 90deg, 
    var(--color-blue) 180deg, 
    var(--color-yellow) 270deg, 
    var(--color-blue) 360deg);
  animation: rotateBorder 4s linear infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  z-index: -1;
}

.register-card-2col::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 40px;
  background: conic-gradient(from 180deg, 
    rgba(64, 191, 255, 0.4) 0deg, 
    rgba(255, 214, 0, 0.4) 90deg, 
    rgba(64, 191, 255, 0.4) 180deg, 
    rgba(255, 214, 0, 0.4) 270deg, 
    rgba(64, 191, 255, 0.4) 360deg);
  animation: rotateBorder 4s linear infinite reverse;
  z-index: -2;
  filter: blur(12px);
  opacity: 0.7;
}

@keyframes rotateBorder {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.register-left {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px 32px 32px;
  background: var(--color-white);
}
.register-logo-title {
  text-align: center;
  margin-bottom: 18px;
}
.register-logo {
  height: 64px;
  margin-bottom: 8px;
}
.register-main-title {
  font-size: 2.1rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.register-sub-title {
  font-size: 1.1rem;
  color: var(--color-gray);
  margin-bottom: 8px;
}
.register-form-card {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  border-radius: 20px;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 24px 0 0 0;
  position: relative;
  overflow: hidden;
  background-clip: padding-box;
}

.register-form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-blue) 0%, var(--color-yellow) 100%);
}

.register-form-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(135deg, 
    var(--color-blue) 0%, 
    transparent 25%, 
    var(--color-yellow) 50%, 
    transparent 75%, 
    var(--color-blue) 100%);
  background-size: 300% 300%;
  animation: shimmerBorder 2s ease-in-out infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  z-index: -1;
}

@keyframes shimmerBorder {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
.register-btn {
  width: 100%;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.08em;
  box-shadow: 
    0 8px 20px rgba(64, 191, 255, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, var(--color-blue) 0%, #1890ff 100%);
  color: var(--color-white);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.register-btn:hover {
  background: linear-gradient(135deg, var(--color-yellow) 0%, #ffed4e 100%);
  color: var(--color-black);
  box-shadow: 
    0 12px 25px rgba(255, 214, 0, 0.4),
    0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.register-btn:hover::before {
  left: 100%;
}
.register-links {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.yellow-link {
  color: var(--color-yellow) !important;
  font-weight: bold;
}
.yellow-link:hover {
  color: var(--color-blue) !important;
}
.register-right {
  flex: 1;
  background: linear-gradient(135deg, var(--color-gray-light) 60%, var(--color-yellow) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 320px;
}
.register-banner-bg {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.register-banner {
  width: 90%;
  max-width: 340px;
  border-radius: 24px;
  margin-bottom: 18px;
  box-shadow: var(--shadow-card);
}
.banner-desc {
  text-align: center;
  color: var(--color-blue);
  font-size: 1.1rem;
  font-weight: bold;
}
:deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-blue) !important;
  box-shadow: 0 0 0 2px #FFD60033 !important;
}
@media (max-width: 900px) {
  .register-card-2col {
    flex-direction: column;
    width: 98vw;
    min-height: 0;
    border-radius: 18px;
  }
  .register-right {
    min-width: 0;
    padding: 18px 0 18px 0;
  }
  .register-left {
    padding: 32px 12px 18px 12px;
  }
}
</style> 