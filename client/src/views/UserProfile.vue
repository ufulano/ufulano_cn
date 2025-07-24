<template>
  <el-container>
    <el-header>
      <el-button @click="goBack">返回</el-button>
      <h2>个人主页</h2>
    </el-header>
    <el-main>
      <!-- 用户信息区 -->
      <el-card class="user-info-card">
        <div style="display:flex;align-items:center;">
          <el-avatar :src="user.avatar_url || ''" size="large" style="margin-right:16px" />
          <div>
            <div style="font-weight:bold;font-size:1.2rem;">{{ user.username }}</div>
            <div style="color:#b9935a;">{{ user.email }}</div>
            <div v-if="user.bio" style="margin-top:4px;">{{ user.bio }}</div>
          </div>
        </div>
      </el-card>
      <!-- 帖子列表区 -->
      <el-card class="user-posts-card" style="margin-top:24px;">
        <div style="font-weight:bold;margin-bottom:8px;">我的帖子</div>
        <el-empty v-if="posts.length === 0" description="暂无帖子" />
        <el-timeline v-else>
          <el-timeline-item v-for="p in posts" :key="p.id" :timestamp="p.time">
            <span style="font-weight:bold">{{ p.content }}</span>
          </el-timeline-item>
        </el-timeline>
      </el-card>
      <!-- 点赞历史区 -->
      <el-card class="user-likes-card" style="margin-top:24px;">
        <div style="font-weight:bold;margin-bottom:8px;">点赞历史</div>
        <el-empty v-if="likes.length === 0" description="暂无点赞" />
        <el-timeline v-else>
          <el-timeline-item v-for="l in likes" :key="l.like_id" :timestamp="l.like_time">
            <span>帖子ID: {{ l.post_id }}</span>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { fetchPosts } from '../api/post'
import { likePost } from '../api/like'

const router = useRouter()
const userStore = useUserStore()
const user = ref(userStore.user || {})
const posts = ref([])
const likes = ref([])

const goBack = () => router.back()

const loadUserPosts = async () => {
  try {
    const allPosts = await fetchPosts()
    posts.value = allPosts.filter(p => p.username === user.value.username)
  } catch (e) {
    posts.value = []
  }
}
const loadUserLikes = async () => {
  // TODO: 调用真实API获取点赞历史
  likes.value = []
}
onMounted(() => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  user.value = userStore.user
  loadUserPosts()
  loadUserLikes()
})
</script>

<style scoped>
.user-info-card {
  margin-bottom: 24px;
}
</style> 