<template>
  <!-- 用户侧边栏导航 -->
  <aside class="user-sidebar">
    <!-- 侧边栏标题 -->
    <div class="sidebar-header">
      <h3>个人主页</h3>
    </div>
    
    <!-- 导航菜单 -->
    <nav class="sidebar-nav">
      <!-- 我的主页 -->
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'profile' }"
        @click="handleNavClick('profile')"
      >
        <el-icon><User /></el-icon>
        <span>我的主页</span>
      </div>
      
      <!-- 我的关注 -->
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'follow' }"
        @click="handleNavClick('follow')"
      >
        <el-icon><UserFilled /></el-icon>
        <span>我的关注</span>
      </div>
      
      <!-- 我的粉丝 -->
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'fans' }"
        @click="handleNavClick('fans')"
      >
        <el-icon><UserFilled /></el-icon>
        <span>我的粉丝</span>
      </div>
      
      <!-- 我的收藏 -->
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'favorites' }"
        @click="handleNavClick('favorites')"
      >
        <el-icon><Star /></el-icon>
        <span>我的收藏</span>
      </div>
      
      <!-- 我的赞 -->
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'likes' }"
        @click="handleNavClick('likes')"
      >
        <el-icon><StarFilled /></el-icon>
        <span>我的赞</span>
      </div>
      
      <!-- 创作者中心 -->
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'creator' }"
        @click="handleNavClick('creator')"
      >
        <el-icon><Setting /></el-icon>
        <span>创作者中心</span>
      </div>
    </nav>
  </aside>
</template>

<script setup>
/**
 * 用户侧边栏组件
 * 
 * 功能：
 * - 用户个人主页导航菜单
 * - 显示用户相关功能入口
 * - 根据当前路由高亮对应菜单项
 * - 支持路由跳转
 * 
 * 特性：
 * - 响应式设计
 * - 粘性定位
 * - 路由状态感知
 * - 图标和文字组合
 */

import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  User, 
  UserFilled, 
  Star, 
  StarFilled, 
  Setting
} from '@element-plus/icons-vue'

// 组件内部状态
const route = useRoute()
const router = useRouter()

/**
 * 根据当前路由确定活动标签
 * 根据URL路径判断当前应该高亮哪个导航项
 */
const activeTab = computed(() => {
  const path = route.path
  if (path.includes('/follow')) return 'follow'
  if (path.includes('/fans')) return 'fans'
  if (path.includes('/favorites')) return 'favorites'
  if (path.includes('/likes')) return 'likes'
  if (path.includes('/creator')) return 'creator'
  return 'profile'
})

/**
 * 处理导航点击事件
 * 根据点击的标签跳转到对应的路由
 * 
 * @param {string} tab - 点击的导航标签
 */
const handleNavClick = (tab) => {
  const userId = route.params.id || 1
  
  switch (tab) {
    case 'profile':
      router.push(`/user/${userId}`)
      break
    case 'follow':
      router.push(`/user/${userId}/follow`)
      break
    case 'fans':
      router.push(`/user/${userId}/fans`)
      break
    case 'favorites':
      router.push(`/user/${userId}/favorites`)
      break
    case 'likes':
      router.push(`/user/${userId}/likes`)
      break
    case 'creator':
      router.push(`/user/${userId}/creator`)
      break
  }
}
</script>

<style scoped>
.user-sidebar {
  width: 240px;
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  padding: 24px 0;
  height: fit-content;
  position: sticky;
  top: 100px;
}

.sidebar-header {
  padding: 0 24px 20px;
  border-bottom: 1px solid var(--color-gray-light);
  margin-bottom: 20px;
}

.sidebar-header h3 {
  margin: 0;
  color: var(--color-gray-dark);
  font-size: 16px;
  font-weight: 600;
}

.sidebar-nav {
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--color-gray-dark);
}

.nav-item:hover {
  background: var(--color-gray-light);
  color: var(--color-blue);
}

.nav-item.active {
  background: var(--color-blue);
  color: var(--color-white);
}

.nav-item .el-icon {
  font-size: 18px;
}

.nav-item span {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-sidebar {
    width: 100%;
    position: static;
  }
}
</style> 