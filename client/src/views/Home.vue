<template>
  <div class="home-root">
    <AppHeader />
    <main class="home-main">
      <section class="welcome-section">
        <h1 class="main-title"><span style="color:#222">Uf</span><span style="color:#FFD600">ula</span><span style="color:#222">no</span></h1>
        <div class="main-subtitle">·大脑切片机·</div>
        <div class="main-search">
          <el-input placeholder="想要找到什么有趣的？" class="search-input" v-model="search" />
          <el-button class="search-btn">搜索</el-button>
        </div>
      </section>
      <section class="post-list-section">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :avatar="post.avatar"
          :username="post.username"
          :time="post.time"
          :content="post.content"
          :images="post.images"
          :like-count="post.likes"
        />
      </section>
    </main>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import PostCard from '../components/PostCard.vue'

const search = ref('')
// mock 帖子流数据
const posts = ref([
  {
    id: 1,
    avatar: '',
    username: '小明',
    time: '刚刚',
    content: '欢迎体验全新Ufulano首页！这里是灵感与创意的聚集地。',
    images: [],
    likes: 3
  },
  {
    id: 2,
    avatar: '',
    username: '小红',
    time: '1分钟前',
    content: '你可以在这里发布内容，页面自适应美观，支持多种主题。',
    images: [],
    likes: 1
  }
])
</script>

<style scoped>
.home-root {
  display: flex;
  flex-direction: column;
  background: #E6F7FF;
  overflow-x: hidden;
  box-sizing: border-box;
}
.home-main {
  flex: 1 1 0;
  width: 100vw;
  background: #E6F7FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px 0;
  box-sizing: border-box;
  overflow-x: hidden;
}
.welcome-section {
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(80,60,20,0.08);
  padding: 36px 32px 28px 32px;
  margin-bottom: 32px;
  width: 60%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  background: #fff;
}
.main-title {
  font-size: 2.8rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-bottom: 10px;
}
.main-subtitle {
  color: #40BFFF;
  font-size: 1.3rem;
  margin-bottom: 24px;
}
.main-search {
  display: flex;
  justify-content: center;
  align-items: center;
}
.search-input {
  width: 320px;
  border-radius: 4px 0 0 4px;
  background: #fff;
  border: 1.5px solid #40BFFF;
}
.search-btn {
  background: #40BFFF;
  color: #fff;
  border-radius: 0 4px 4px 0;
  font-weight: bold;
  border: none;
}
.post-list-section {
  width: 60%;
  max-width: 900px;
  margin-top: 12px;
  margin-left: auto;
  margin-right: auto;
}
@media (max-width: 1200px) {
  .welcome-section, .post-list-section {
    max-width: 98vw;
    width: 98vw;
    padding: 8px;
  }
  .main-title {
    font-size: 2rem;
  }
  .search-input {
    width: 160px;
  }
}
</style> 