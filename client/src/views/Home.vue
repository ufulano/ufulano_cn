<template>
  <el-container class="home-bg">
    <el-header>
      <div class="header-left">
        <h2>ufulano</h2>
      </div>
      <div class="header-right" v-if="userStore.user">
        <el-avatar :src="userStore.user.avatar_url || ''" size="small" style="margin-right:8px" />
        <span class="username">{{ userStore.user.username }}</span>
        <el-button type="text" @click="onLogout">登出</el-button>
      </div>
    </el-header>
    <el-main>
      <div class="debug-info">
        <el-alert title="前端调试模式：无后端数据，页面为魔戒风格演示版" type="info" show-icon />
      </div>
      <div class="home-center panel-shadow">
        <div class="feature-btns">
          <el-button type="primary" @click="goNewPost">发帖</el-button>
          <el-button type="primary" @click="goLogin">登录</el-button>
          <el-button type="primary" @click="goRegister">注册</el-button>
          <el-button type="primary" @click="goProfile">个人主页</el-button>
          <el-button type="primary" @click="goDetail(1)">帖子详情</el-button>
        </div>
        <el-divider content-position="center">演示帖子流</el-divider>
        <el-empty v-if="loading" description="加载中..." />
        <el-empty v-else-if="posts.length === 0" description="暂无帖子" />
        <el-row v-else gutter="20">
          <el-col :span="24" v-for="post in posts" :key="post.id" style="margin-bottom: 20px;">
            <el-card shadow="hover">
              <div style="display:flex;align-items:center;">
                <el-avatar :src="post.avatar" size="small" />
                <span style="margin-left:8px;font-weight:bold">{{ post.username }}</span>
                <span style="margin-left:auto;color:#b9935a">{{ post.time }}</span>
              </div>
              <div style="margin:12px 0;white-space:pre-line;">{{ post.content }}</div>
              <div v-if="post.image">
                <el-image v-for="img in parseImages(post.image)" :key="img" :src="img" style="max-width:120px;margin-right:8px;" fit="cover" />
              </div>
              <div style="margin-top:8px;display:flex;align-items:center;">
                <el-button size="small" type="text" @click="goDetail(post.id)">评论({{ post.comments }})</el-button>
                <el-button size="small" type="text" @click="onLike(post.id)">
                  <el-icon><i class="el-icon-thumb" /></el-icon> {{ post.likes }}
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { fetchPosts } from '../api/post'

const router = useRouter()
const userStore = useUserStore()
const posts = ref([])
const loading = ref(true)

const loadPosts = async () => {
  loading.value = true
  try {
    posts.value = await fetchPosts()
  } catch (e) {
    // 错误已由拦截器处理
    posts.value = [
      { id: 1, username: '小明', avatar: '', time: '刚刚', content: '欢迎体验灵幻主题前端！这是一个美观的社交网站演示。', image: '', comments: 0, likes: 0 },
      { id: 2, username: '小红', avatar: '', time: '1分钟前', content: '你可以在这里发布内容，页面自适应美观，支持多种主题。', image: '', comments: 0, likes: 0 }
    ]
  } finally {
    loading.value = false
  }
}

const onLike = async (id) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再操作')
    router.push('/login')
    return
  }
  // TODO: 调用 likePost(id) 实现点赞
  ElMessage.success('演示点赞成功')
  loadPosts()
}
const goDetail = (id) => {
  router.push(`/post/${id}`)
}
const goNewPost = () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后发帖')
    router.push('/login')
    return
  }
  router.push('/post/new')
}
const goLogin = () => {
  router.push('/login')
}
const goRegister = () => {
  router.push('/register')
}
const goProfile = () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后访问个人中心')
    router.push('/login')
    return
  }
  router.push('/user/1')
}
const onLogout = () => {
  userStore.logout()
  router.push('/login')
}
const parseImages = (imgStr) => {
  try {
    const arr = JSON.parse(imgStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
onMounted(loadPosts)
</script>

<style scoped>
.home-bg {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: none;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px;
}
.header-left h2 {
  margin: 0;
  font-size: 2rem;
  letter-spacing: 2px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.username {
  font-weight: bold;
  margin-right: 8px;
  color: var(--gold);
}
.el-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
  background: none;
}
.home-center {
  width: var(--panel-width);
  max-width: var(--panel-max-width);
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  border: 2px solid var(--gold);
  padding: 32px 24px 24px 24px;
}
.panel-shadow {
  box-shadow: 0 8px 40px 0 rgba(80, 60, 20, 0.22);
}
.debug-info {
  width: var(--panel-width);
  max-width: var(--panel-max-width);
  margin: 0 auto 24px auto;
}
.feature-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}
@media (max-width: 900px) {
  .home-center, .debug-info {
    width: 98vw;
    max-width: 100vw;
    padding: 8px;
  }
  .el-header {
    padding: 0 8px;
  }
}
</style> 