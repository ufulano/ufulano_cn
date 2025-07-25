<template>
  <nav class="user-sidebar">
    <div class="sidebar-avatar-box">
      <el-avatar :src="user.avatar_url" size="large" />
      <div class="sidebar-nickname">{{ user.nickname || user.username }}</div>
    </div>
    <ul class="sidebar-menu">
      <li :class="{active: active==='profile'}" @click="go('profile')">我的主页</li>
      <li :class="{active: active==='follow'}" @click="go('follow')">我的关注</li>
      <li :class="{active: active==='fans'}" @click="go('fans')">我的粉丝</li>
      <li :class="{active: active==='favorites'}" @click="go('favorites')">我的收藏</li>
      <li :class="{active: active==='likes'}" @click="go('likes')">我的赞</li>
    </ul>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '../store/user'
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const user = computed(() => userStore.userInfo || { username: '未登录', nickname: '', avatar_url: '' })
const active = computed(() => {
  if (route.name === 'UserProfile') return 'profile'
  if (route.name === 'UserFollow') return 'follow'
  if (route.name === 'UserFans') return 'fans'
  if (route.name === 'UserFavorites') return 'favorites'
  if (route.name === 'UserLikes') return 'likes'
  return ''
})
function go(type) {
  if (type === 'profile') router.push({ name: 'UserProfile' })
  if (type === 'follow') router.push({ name: 'UserFollow' })
  if (type === 'fans') router.push({ name: 'UserFans' })
  if (type === 'favorites') router.push({ name: 'UserFavorites' })
  if (type === 'likes') router.push({ name: 'UserLikes' })
}
</script>

<style scoped>
.user-sidebar {
  width: 210px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(64,191,255,0.08);
  padding: 32px 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sidebar-avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.sidebar-nickname {
  margin-top: 12px;
  color: #40BFFF;
  font-weight: bold;
  font-size: 1.1rem;
}
.sidebar-menu {
  list-style: none;
  padding: 0;
  width: 100%;
}
.sidebar-menu li {
  width: 100%;
  padding: 12px 0 12px 32px;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.sidebar-menu li.active {
  background: #E6F7FF;
  color: #40BFFF;
  border-left: 4px solid #FFD600;
  font-weight: bold;
}
.sidebar-menu li:hover {
  background: #f7fbff;
  color: #40BFFF;
}
</style> 