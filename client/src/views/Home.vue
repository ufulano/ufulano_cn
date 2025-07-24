<template>
  <el-container>
    <el-header>
      <el-button type="primary" @click="goNewPost" style="float:right">发帖</el-button>
      <h2>首页</h2>
    </el-header>
    <el-main>
      <el-empty v-if="loading" description="加载中..." />
      <el-empty v-else-if="posts.length === 0" description="暂无帖子" />
      <el-row v-else gutter="20">
        <el-col :span="24" v-for="post in posts" :key="post.id" style="margin-bottom: 20px;">
          <el-card shadow="hover">
            <div style="display:flex;align-items:center;">
              <el-avatar :src="post.avatar" size="small" />
              <span style="margin-left:8px;font-weight:bold">{{ post.username }}</span>
              <span style="margin-left:auto;color:#888">{{ post.time }}</span>
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
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPosts } from '../api/post'
import { likePost } from '../api/like'
import { ElMessage } from 'element-plus'

const router = useRouter()
const posts = ref([])
const loading = ref(true)

const loadPosts = async () => {
  loading.value = true
  try {
    posts.value = await fetchPosts()
  } catch (e) {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

const onLike = async (id) => {
  try {
    await likePost(id)
    ElMessage.success('操作成功')
    loadPosts()
  } catch (e) {}
}

const goDetail = (id) => {
  router.push(`/post/${id}`)
}
const goNewPost = () => {
  router.push('/post/new')
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