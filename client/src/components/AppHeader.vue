<template>
  <header class="home-header">
    <div class="header-left">
      <img src="../logo.png" alt="logo" class="logo-img" @click="$router.push('/')" style="cursor:pointer;" />
      <span class="logo-text">Ufulano</span>
    </div>
    <nav class="header-nav">
      <el-dropdown>
        <el-button class="more-btn" type="primary">
          More！!！<el-icon style="margin-left:4px;"><i class="el-icon-arrow-down" /></el-icon>
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
      <router-link to="/community" class="nav-link nav-hide-on-mobile">社区</router-link>
      <router-link to="/" class="nav-link nav-hide-on-mobile">资源</router-link>
      <router-link to="/" class="nav-link nav-hide-on-mobile">联系</router-link>
      <router-link to="/" class="nav-link nav-hide-on-mobile">信箱</router-link>
      <template v-if="userStore.token">
        <el-dropdown trigger="click">
          <span class="user-avatar-wrap">
            <el-avatar :src="userStore.user?.avatar_url || ''" size="small" style="cursor:pointer;" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$router.push(`/user/${userStore.user?.user_id || 1}`)">我的主页</el-dropdown-item>
              <el-dropdown-item @click="$router.push(`/user/${userStore.user?.user_id || 1}/follow`)">我的关注</el-dropdown-item>
              <el-dropdown-item @click="$router.push(`/user/${userStore.user?.user_id || 1}/fans`)">我的粉丝</el-dropdown-item>
              <el-dropdown-item @click="$router.push(`/user/${userStore.user?.user_id || 1}/favorites`)">我的收藏</el-dropdown-item>
              <el-dropdown-item @click="$router.push(`/user/${userStore.user?.user_id || 1}/likes`)">我的赞</el-dropdown-item>
              <el-dropdown-item divided @click="onLogout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="login-btn" @click="onLogout">登出</el-button>
      </template>
      <template v-else>
        <el-button class="login-btn" @click="$router.push('/login')">登录</el-button>
        <el-button class="register-btn" @click="$router.push('/register')">注册</el-button>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
const userStore = useUserStore()
const router = useRouter()
const onLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.home-header {
  background: #40BFFF;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5vw;
  width: 100%;
  min-width: 0;
  left: 0;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  position: fixed;
  top: 0;
  z-index: 100;
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
  color: #FFD600;
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
  color: #fff;
  text-decoration: none;
  font-size: 0.97rem;
  margin: 0 2px;
}
.more-btn {
  background: #FFD600 !important;
  color: #222 !important;
  border: none;
  font-weight: bold;
  border-radius: 8px;
  box-shadow: none;
  padding: 0 14px;
  font-size: 1.08em;
  transition: background 0.2s, color 0.2s;
}
.more-btn:hover {
  background: #e6b800 !important;
  color: #fff !important;
}
.login-btn {
  background: #fff;
  color: #40BFFF;
  border: 1.5px solid #40BFFF;
  margin-left: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(64,191,255,0.10);
  font-weight: bold;
  padding: 0 14px;
  font-size: 1.08em;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.login-btn:hover {
  background: #40BFFF;
  color: #fff;
  box-shadow: 0 4px 18px 0 rgba(64,191,255,0.18);
}
.register-btn {
  background: #222;
  color: #fff;
  border: none;
  margin-left: 8px;
  border-radius: 8px;
  font-weight: bold;
  padding: 0 14px;
  font-size: 1.08em;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  transition: background 0.2s, color 0.2s, border 0.2s, box-shadow 0.2s;
}
.register-btn:hover {
  background: #fff;
  color: #222;
  border: 1.5px solid #222;
  box-shadow: 0 4px 18px 0 rgba(0,0,0,0.18);
}
:deep(.el-button--primary) {
  border-radius: 8px !important;
  box-shadow: 0 2px 12px 0 rgba(64,191,255,0.10) !important;
  font-weight: bold;
  font-size: 1.08em;
  padding: 0 22px;
  background: linear-gradient(90deg, #40BFFF 0%, #1890ff 100%) !important;
  border: none !important;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s !important;
}
:deep(.el-button--primary:hover) {
  background: linear-gradient(90deg, #1890ff 0%, #40BFFF 100%) !important;
  color: #fff !important;
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
@media (max-width: 600px) {
  .nav-hide-on-mobile {
    display: none !important;
  }
}
</style> 