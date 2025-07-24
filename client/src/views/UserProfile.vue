<template>
  <el-container>
    <el-header>
      <el-button @click="goBack">返回</el-button>
      <h2>个人主页</h2>
    </el-header>
    <el-main>
      <!-- 用户信息区 -->
      <el-card class="user-info-card">
        <div>用户信息区（待补充）</div>
      </el-card>
      <!-- 帖子列表区 -->
      <el-card class="user-posts-card" style="margin-top:24px;">
        <div>用户帖子列表区（待补充）</div>
      </el-card>
      <!-- 点赞历史区 -->
      <el-card class="user-likes-card" style="margin-top:24px;">
        <div>点赞历史区（待补充）</div>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()
// TODO: onMounted 加载用户信息、帖子、点赞历史等
</script>

<style scoped>
.user-info-card {
  margin-bottom: 24px;
}
</style> 