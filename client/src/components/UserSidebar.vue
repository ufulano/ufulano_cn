<template>
  <aside class="user-sidebar">
    <div class="sidebar-header">
      <h3>个人主页</h3>
    </div>
    
    <nav class="sidebar-nav">
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'profile' }"
        @click="handleNavClick('profile')"
      >
        <el-icon><User /></el-icon>
        <span>我的主页</span>
      </div>
      
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'follow' }"
        @click="handleNavClick('follow')"
      >
        <el-icon><UserFilled /></el-icon>
        <span>我的关注</span>
      </div>
      
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'fans' }"
        @click="handleNavClick('fans')"
      >
        <el-icon><UserFilled /></el-icon>
        <span>我的粉丝</span>
      </div>
      
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'favorites' }"
        @click="handleNavClick('favorites')"
      >
        <el-icon><Star /></el-icon>
        <span>我的收藏</span>
      </div>
      
      <div 
        class="nav-item" 
        :class="{ active: activeTab === 'likes' }"
        @click="handleNavClick('likes')"
      >
        <el-icon><StarFilled /></el-icon>
        <span>我的赞</span>
      </div>
      
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  User, 
  UserFilled, 
  Star, 
  StarFilled, 
  Setting
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 根据当前路由确定活动标签
const activeTab = computed(() => {
  const path = route.path
  if (path.includes('/follow')) return 'follow'
  if (path.includes('/fans')) return 'fans'
  if (path.includes('/favorites')) return 'favorites'
  if (path.includes('/likes')) return 'likes'
  if (path.includes('/creator')) return 'creator'
  return 'profile'
})

// 处理导航点击
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