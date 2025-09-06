
<template>
  <!-- 应用头部导航栏 -->
  <header class="home-header">
    <!-- 左侧Logo区域 -->
    <div class="header-left">
      <img src="../logo.png" alt="logo" class="logo-img" @click="$router.push('/')" style="cursor:pointer;" />
    </div>
    <!-- 右侧导航区域 -->
    <nav class="header-nav">
      <!-- 更多功能下拉菜单 -->
      <el-dropdown>
        <el-button class="more-btn" type="primary">
          More!!!<el-icon style="margin-left:4px;"><i class="el-icon-arrow-down" /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/game1')">game1</el-dropdown-item>
            <el-dropdown-item @click="$router.push('/game2')">game2</el-dropdown-item>
            <el-dropdown-item @click="$router.push('/game3')">game3</el-dropdown-item>
            <el-dropdown-item @click="$router.push('/game4')">game4</el-dropdown-item>
            <el-dropdown-item @click="$router.push('/game5')">game5</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 导航链接 -->
      <router-link to="/community" class="nav-link nav-hide-on-mobile">社区</router-link>
      <router-link to="/" class="nav-link nav-hide-on-mobile">资源</router-link>
      <router-link to="/" class="nav-link nav-hide-on-mobile">联系</router-link>
      <router-link to="/" class="nav-link nav-hide-on-mobile">信箱</router-link>
      <!-- 用户登录状态相关按钮 -->
      <template v-if="userStore.isLoggedIn">
        <!-- 用户头像下拉菜单 -->
        <el-dropdown trigger="click">
          <span class="user-avatar-wrap">
            <AvatarUpload 
              :avatar="parseAvatar(userStore.avatar)" 
              size="small" 
              :editable="false"
              class="header-avatar"
            />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push(`/user/${userStore.user?.user_id || 1}`)">我的主页</el-dropdown-item>
              <el-dropdown-item @click="$router.push('/settings')">账号设置</el-dropdown-item>
              <el-dropdown-item @click="$router.push('/community')">社区中心</el-dropdown-item>
              <el-dropdown-item divided @click="onLogout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="login-btn" @click="onLogout">登出</el-button>
      </template>
      <!-- 未登录状态显示登录注册按钮 -->
      <template v-else>
        <el-button class="login-btn" @click="$router.push('/login')">登录</el-button>
        <el-button class="register-btn" @click="$router.push('/register')">注册</el-button>
      </template>
    </nav>
  </header>
</template>

<script setup>
/**
 * 应用头部导航组件
 * 
 * 功能：
 * - 显示网站Logo和导航链接
 * - 用户登录状态管理
 * - 用户头像和下拉菜单
 * - 登录/注册/登出功能
 * - 响应式导航设计
 * 
 * 特性：
 * - 固定顶部定位
 * - 响应式设计
 * - 用户状态感知
 * - 路由导航集成
 */

import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import AvatarUpload from './AvatarUpload.vue'
import { parseAvatar } from '../utils/avatar'

// 组件内部状态
const userStore = useUserStore()
const router = useRouter()

/**
 * 用户登出处理函数
 * 清除用户状态并跳转到登录页面
 */
const onLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-header {
  background: rgba(64, 191, 255, 0.95);
  backdrop-filter: blur(20px);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  width: 100%;
  min-width: 0;
  left: 0;
  margin: 0;
  border-radius: 0;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: fixed;
  top: 0;
  z-index: 100;
  box-sizing: border-box;
  border-bottom: 2px solid transparent;
  background-clip: padding-box;
}

.home-header::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    var(--color-blue) 0%, 
    var(--color-yellow) 25%, 
    var(--color-blue) 50%, 
    var(--color-yellow) 75%, 
    var(--color-blue) 100%);
  background-size: 200% 200%;
  animation: headerBorderFlow 2s ease-in-out infinite;
}

.home-header::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, 
    rgba(64, 191, 255, 0.3) 0%, 
    rgba(255, 214, 0, 0.3) 25%, 
    rgba(64, 191, 255, 0.3) 50%, 
    rgba(255, 214, 0, 0.3) 75%, 
    rgba(64, 191, 255, 0.3) 100%);
  background-size: 200% 200%;
  animation: headerBorderFlow 2s ease-in-out infinite reverse;
  filter: blur(4px);
  opacity: 0.6;
}

@keyframes headerBorderFlow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
.header-left {
  display: flex;
  align-items: center;
}
.logo-img {
  height: 80px;
  margin-right: 24px;
}
.logo-text {
  font-size: 2rem;
  font-family: serif;
  font-weight: bold;
  letter-spacing: 2px;
  color: var(--color-yellow);
}
.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  min-width: 0;
  overflow-x: auto;
  font-size: 0.97rem;
}
.nav-link {
  color: var(--color-white);
  text-decoration: none;
  font-size: 0.97rem;
  margin: 0 2px;
}
.more-btn {
  background: linear-gradient(135deg, var(--color-yellow) 0%, #ffed4e 100%) !important;
  color: var(--color-black) !important;
  border: none;
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 
    0 6px 20px rgba(255, 214, 0, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.1);
  padding: 0 16px;
  font-size: 1.08em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.more-btn:hover {
  background: linear-gradient(135deg, #ffed4e 0%, var(--color-yellow) 100%) !important;
  color: var(--color-black) !important;
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(255, 214, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.more-btn:hover::before {
  left: 100%;
}
.login-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: var(--color-blue);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-left: 8px;
  border-radius: 12px;
  box-shadow: 
    0 6px 20px rgba(255, 255, 255, 0.3),
    0 3px 8px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  padding: 0 16px;
  font-size: 1.08em;
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
  background: linear-gradient(90deg, transparent, rgba(64, 191, 255, 0.1), transparent);
  transition: left 0.5s;
}

.login-btn:hover {
  background: rgba(64, 191, 255, 0.9);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(64, 191, 255, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-btn:hover::before {
  left: 100%;
}
.register-btn {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: var(--color-white);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-left: 8px;
  border-radius: 12px;
  font-weight: bold;
  padding: 0 16px;
  font-size: 1.08em;
  box-shadow: 
    0 6px 20px rgba(0, 0, 0, 0.2),
    0 3px 8px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.register-btn:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
  color: var(--color-black);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(255, 255, 255, 0.3),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.register-btn:hover::before {
  left: 100%;
}
:deep(.el-button--primary) {
  border-radius: 8px !important;
  box-shadow: var(--shadow-card) !important;
  font-weight: bold;
  font-size: 1.08em;
  padding: 0 22px;
  background: linear-gradient(90deg, var(--color-blue) 0%, var(--color-blue-dark) 100%) !important;
  border: none !important;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s !important;
}
:deep(.el-button--primary:hover) {
  background: linear-gradient(90deg, var(--color-blue-dark) 0%, var(--color-blue) 100%) !important;
  color: var(--color-white) !important;
  box-shadow: 0 4px 18px 0 rgba(64,191,255,0.18) !important;
}
@media (max-width: 900px) {
  .home-header {
    padding: 0 2vw;
  }
  .header-nav {
    gap: 4px;
    font-size: 0.93rem;
  }
  .more-btn, .login-btn, .register-btn {
    padding: 0 8px;
  }
}
.user-avatar-wrap {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.header-avatar {
  cursor: pointer;
}

.header-avatar .avatar-overlay {
  display: none;
}

@media (max-width: 600px) {
  .nav-hide-on-mobile {
    display: none !important;
  }
}
</style> 