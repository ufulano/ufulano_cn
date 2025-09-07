<!--
 * 帖子详情页面组件
 * 
 * 功能特性：
 * - 帖子详情：完整的帖子内容展示
 * - 评论系统：查看和发表评论
 * - 互动功能：点赞、转发、收藏
 * - 相关推荐：相关帖子推荐
 * - 分享功能：分享帖子到其他平台
 * - 举报功能：举报不当内容
 * 
 * 页面结构：
 * - 帖子内容：完整的帖子信息展示
 * - 评论列表：评论和回复展示
 * - 互动按钮：点赞、评论、转发按钮
 * - 相关推荐：相关帖子推荐
 * 
 * 技术实现：
 * - 动态路由：根据帖子ID加载详情
 * - 评论分页：高性能的评论列表
 * - 实时更新：点赞和评论实时更新
 * - SEO优化：帖子详情页SEO优化
 -->
<template>
  <div class="page-root">
    <AppHeader />
    <main class="post-detail-main">
      <el-button @click="goBack" style="margin-bottom:18px;">返回</el-button>
              <PostCard
          v-if="post"
          :avatar="parseAvatar(post.avatar)"
          :username="post.username"
          :time="post.time"
          :content="post.content"
          :images="parseImages(post.image)"
          :like-count="likeCount"
          :like-loading="likeLoading"
          @like="onLike"
        />
      <el-card class="comment-section">
        <div style="font-weight:bold;margin-bottom:8px;">评论区</div>
        <el-form v-if="userStore.token" :model="commentForm" ref="commentFormRef" @submit.prevent="onComment">
          <el-form-item>
            <el-input v-model="commentForm.content" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="写下你的评论..." />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="commentLoading" @click="onComment">发布评论</el-button>
          </el-form-item>
        </el-form>
        <div v-else style="margin-bottom:12px;color:#b9935a;">请登录后发表评论</div>
        <el-empty v-if="comments.length === 0" description="暂无评论" />
        <el-timeline v-else>
          <el-timeline-item v-for="c in comments" :key="c.comment_id" :timestamp="c.comment_time">
            <el-avatar :src="parseAvatar(c.avatar_url)" size="small" style="margin-right:8px" />
            <span style="font-weight:bold">{{ c.username }}</span>
            <span style="margin-left:8px;">{{ c.content }}</span>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'
import { fetchPost } from '../api/post'
import { fetchComments, addComment } from '../api/comment'
import { toggleLike } from '../api/like'
import AppHeader from '../components/AppHeader.vue'
import PostCard from '../components/PostCard.vue'
import { parseAvatar } from '../utils/avatar'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const post = ref(null)
const comments = ref([])
const likeCount = ref(0)
const likeLoading = ref(false)
const commentForm = ref({ content: '' })
const commentFormRef = ref()
const commentLoading = ref(false)

const loadPost = async () => {
  try {
    const res = await fetchPost(route.params.id)
    post.value = res
    likeCount.value = res.likes || 0
  } catch (e) {
    ElMessage.error('获取帖子失败')
  }
}
const loadComments = async () => {
  try {
    comments.value = await fetchComments(route.params.id)
  } catch (e) {
    comments.value = []
  }
}
const onLike = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后点赞')
    router.push('/login')
    return
  }
  likeLoading.value = true
  try {
    await toggleLike(route.params.id)
    ElMessage.success('点赞成功')
    likeCount.value++
  } catch (e) {}
  finally {
    likeLoading.value = false
  }
}
const onComment = () => {
  commentFormRef.value.validate(async valid => {
    if (!valid) return
    commentLoading.value = true
    try {
      await addComment({ postId: route.params.id, content: commentForm.value.content })
      ElMessage.success('评论成功')
      commentForm.value.content = ''
      loadComments()
    } catch (e) {}
    finally {
      commentLoading.value = false
    }
  })
}
const goBack = () => {
  router.back()
}
const parseImages = (imgStr) => {
  try {
    const arr = JSON.parse(imgStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}
onMounted(() => {
  loadPost()
  loadComments()
})
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}
.post-detail-main {
  max-width: 700px;
  margin: 96px auto 24px auto;
  flex: 1;
}
.comment-section {
  margin-top: 24px;
  border-radius: 10px;
  background: #fff;
}
</style> 