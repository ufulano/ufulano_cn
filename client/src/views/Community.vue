<template>
  <div class="community-root">
    <AppHeader />
    <main class="community-main">
      <!-- 主内容区：大卡片，左文右图 -->
      <section class="community-hero-row">
        <div class="hero-left">
          <h1 class="hero-title">社区中心</h1>
          <p class="hero-subtitle">欢迎加入社区，发现有趣的人和事，分享你的生活与观点。</p>
          <el-button class="hero-btn" type="primary" size="large">立即加入</el-button>
        </div>
        <div class="hero-right">
          <img class="hero-img" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80" alt="社区Banner" />
        </div>
      </section>
      <!-- 分区内容 -->
      <section class="community-section">
        <h2 class="section-title">热门话题</h2>
        <div class="card-list">
          <div class="topic-card" v-for="item in topics" :key="item.title">
            <img class="card-img" :src="item.img" :alt="item.title" />
            <div class="card-content">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue'
import { ref } from 'vue'
const topics = ref([
  {
    title: '美食分享',
    desc: '晒出你的美食日常，发现更多美味。',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: '运动健康',
    desc: '记录运动点滴，分享健康生活方式。',
    img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80'
  },
  {
    title: '旅行见闻',
    desc: '探索世界的美好瞬间。',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'
  }
])
</script>

<style scoped>
.community-root {
  background: var(--color-gray-light);
  min-height: 100vh;
  width: 100%;
}

.community-main {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 64px 16px 32px;
}

.community-hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--color-white);
  border-radius: 18px;
  box-shadow: var(--shadow-main);
  padding: 48px;
  margin-bottom: 48px;
  gap: 48px;
}
.hero-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.hero-title {
  font-size: 2.3rem;
  font-weight: bold;
  color: var(--color-blue);
  margin-bottom: 18px;
}
.hero-subtitle {
  font-size: 1.08rem;
  color: var(--color-gray-dark);
  margin-bottom: 32px;
}
.hero-btn {
  background: var(--color-yellow);
  color: var(--color-black);
  border-radius: 8px;
  font-weight: bold;
  border: none;
  box-shadow: var(--shadow-card);
  width: 120px;
}
.hero-btn:hover {
  background: var(--color-yellow-light);
  color: var(--color-black);
}
.hero-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-img {
  width: 320px;
  height: 200px;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: var(--shadow-card);
}
.community-section {
  margin-top: 32px;
}
.section-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: var(--color-blue);
  margin-bottom: 24px;
}
.card-list {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.topic-card {
  background: var(--color-white);
  border-radius: 14px;
  box-shadow: var(--shadow-card);
  width: 260px;
  padding: 0 0 18px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.2s;
}
.topic-card:hover {
  box-shadow: 0 6px 24px 0 rgba(64,191,255,0.18); /* 可选：如需变量可加 --shadow-card-hover */
}
.card-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 14px 14px 0 0;
}
.card-content {
  padding: 16px 18px 0 18px;
  width: 100%;
}
.card-title {
  font-size: 1.08rem;
  font-weight: bold;
  color: var(--color-blue);
  margin-bottom: 8px;
}
.card-desc {
  color: var(--color-gray-dark);
  font-size: 0.98rem;
}
@media (max-width: 900px) {
  .community-main {
    padding: 18px 0 8px 0;
  }
  .community-hero-row {
    flex-direction: column;
    padding: 24px 12px 18px 12px;
    gap: 18px;
    max-width: 98vw;
  }
  .hero-img {
    width: 98vw;
    max-width: 320px;
    height: 140px;
  }
  .card-list {
    flex-direction: column;
    gap: 18px;
    align-items: center;
  }
  .topic-card {
    width: 98vw;
    max-width: 320px;
  }
}
</style> 