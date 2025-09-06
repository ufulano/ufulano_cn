<template>
  <div class="login-bg">
    <AppHeader />
    <div class="login-card-2col">
      <div class="login-left">
        <div class="login-logo-title">
          <img src="../logo.png" alt="logo" class="login-logo" @click="goHome" style="cursor:pointer;" />
          <div class="login-main-title">
            <span style="color:#40BFFF">Uf</span><span style="color:#FFD600">ula</span><span style="color:#40BFFF">no</span>
          </div>
          <div class="login-sub-title">登录</div>
        </div>
        <el-card class="login-form-card" shadow="never">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="70px" @keyup.enter="onSubmit">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" autocomplete="username" clearable placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" autocomplete="current-password" show-password clearable placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="loading" @click="onSubmit" class="login-btn">登录</el-button>
            </el-form-item>
            <div class="login-links">
              <el-button link @click="goRegister" class="yellow-link">注册账号</el-button>
              <el-button link disabled class="yellow-link">忘记密码?</el-button>
            </div>
          </el-form>
        </el-card>
      </div>
      <div class="login-right">
        <div class="login-banner-bg">
          <img class="login-banner" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDA5RUZGIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CYW5uZXI8L3RleHQ+Cjwvc3ZnPgo=" alt="banner" @click="goHome" style="cursor:pointer;" />
          <div class="banner-desc">Ufulano - 发现有趣的人和事</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/auth'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const form = ref({ username: '', password: '', remember: false })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const onSubmit = () => {
  formRef.value.validate(async valid => {
    if (!valid) return
    loading.value = true
    try {
      console.log('=== 登录请求开始 ===')
      console.log('登录表单数据:', form.value)
      
      const res = await login(form.value)
      console.log('=== 登录响应 ===')
      console.log('响应类型:', typeof res)
      console.log('响应是否为对象:', typeof res === 'object')
      console.log('响应键:', Object.keys(res))
      console.log('完整响应:', res)
      console.log('token:', res.token ? '存在' : '不存在')
      console.log('user:', res.user)
      console.log('user 类型:', typeof res.user)
      
      if (!res.user) {
        console.error('❌ 后端没有返回用户数据！')
        ElMessage.error('登录失败：服务器返回数据不完整')
        return
      }
      
      userStore.setUser(res.token, res.user, form.value.remember)
      console.log('✅ 用户数据已设置到 store')
      ElMessage.success('登录成功')
      router.push('/')
    } catch (e) {
      console.error('登录失败:', e)
      ElMessage.error(e?.message || '登录失败')
    } finally {
      loading.value = false
    }
  })
}

const goRegister = () => {
  router.push('/register')
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.login-bg {
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

.login-bg::before {
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
.login-card-2col {
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

.login-card-2col::before {
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

.login-card-2col::after {
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
.login-left {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px 32px 32px;
  background: var(--color-white);
}
.login-logo-title {
  text-align: center;
  margin-bottom: 18px;
}
.login-logo {
  height: 64px;
  margin-bottom: 8px;
}
.login-main-title {
  font-size: 2.1rem;
  font-weight: bold;
  letter-spacing: 2px;
}
.login-sub-title {
  font-size: 1.1rem;
  color: var(--color-gray);
  margin-bottom: 8px;
}
.login-form-card {
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

.login-form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-blue) 0%, var(--color-yellow) 100%);
}

.login-form-card::after {
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
.login-btn {
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

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover {
  background: linear-gradient(135deg, var(--color-yellow) 0%, #ffed4e 100%);
  color: var(--color-black);
  box-shadow: 
    0 12px 25px rgba(255, 214, 0, 0.4),
    0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.login-btn:hover::before {
  left: 100%;
}
.login-links {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
.yellow-link {
  color: var(--color-yellow) !important;
  font-weight: bold;
}
.yellow-link:hover {
  color: var(--color-blue) !important;
}
.login-right {
  flex: 1;
  background: linear-gradient(135deg, var(--color-gray-light) 60%, var(--color-yellow) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 320px;
}
.login-banner-bg {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.login-banner {
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
  .login-card-2col {
    flex-direction: column;
    width: 98vw;
    min-height: 0;
    border-radius: 18px;
  }
  .login-right {
    min-width: 0;
    padding: 18px 0 18px 0;
  }
  .login-left {
    padding: 32px 12px 18px 12px;
  }
}
</style> 