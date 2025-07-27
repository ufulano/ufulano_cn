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
          <img class="login-banner" src="https://via.placeholder.com/400x400?text=Banner" alt="banner" @click="goHome" style="cursor:pointer;" />
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
      const res = await login(form.value)
      userStore.setUser(res.token, res.user, form.value.remember)
      ElMessage.success('登录成功')
      router.push('/')
    } catch (e) {
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
  background: linear-gradient(120deg, #e0e7ef 0%, var(--color-gray-light) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 80px;
  padding-left: 24px;
  padding-right: 24px;
}
.login-card-2col {
  display: flex;
  flex-direction: row;
  width: 820px;
  min-height: 480px;
  background: var(--color-white);
  border-radius: 36px;
  box-shadow: 0 8px 48px 0 rgba(64,191,255,0.13);
  overflow: hidden;
  margin: 0 auto;
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
  border-radius: 18px;
  box-shadow: var(--shadow-card);
  border: none;
  background: var(--color-white);
  padding: 18px 0 0 0;
}
.login-btn {
  width: 100%;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.08em;
  box-shadow: var(--shadow-card);
  background: var(--color-blue);
  color: var(--color-white);
  border: none;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.login-btn:hover {
  background: var(--color-yellow);
  color: var(--color-black);
  box-shadow: 0 4px 18px 0 rgba(255,214,0,0.18);
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