<template>
  <!-- 帖子卡片骨架屏 -->
  <div class="post-card-skeleton">
    <!-- 帖子头部骨架 -->
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-user-info">
        <div class="skeleton-username"></div>
        <div class="skeleton-meta"></div>
      </div>
      <div class="skeleton-extra"></div>
    </div>
    
    <!-- 帖子内容骨架 -->
    <div class="skeleton-content">
      <div class="skeleton-line skeleton-line-long"></div>
      <div class="skeleton-line skeleton-line-medium"></div>
      <div class="skeleton-line skeleton-line-short"></div>
    </div>
    
    <!-- 图片骨架 -->
    <div v-if="hasImages" class="skeleton-images" :data-count="imageCount">
      <div 
        v-for="n in imageCount" 
        :key="n" 
        class="skeleton-image"
      ></div>
    </div>
    
    <!-- 操作按钮骨架 -->
    <div class="skeleton-actions">
      <div class="skeleton-action-btn"></div>
      <div class="skeleton-action-btn"></div>
      <div class="skeleton-action-btn"></div>
    </div>
  </div>
</template>

<script setup>
/**
 * PostCardSkeleton 组件 - 帖子卡片骨架屏
 * 
 * 功能：
 * - 提供帖子卡片的加载占位符
 * - 模拟真实卡片的结构和布局
 * - 支持不同图片数量的骨架显示
 * - 流畅的加载动画效果
 * 
 * 特性：
 * - 响应式设计，适配移动端
 * - 可配置图片数量
 * - 平滑的动画效果
 * - 轻量级实现
 */

const props = defineProps({
  /** 是否有图片 */
  hasImages: {
    type: Boolean,
    default: false
  },
  /** 图片数量 */
  imageCount: {
    type: Number,
    default: 2
  }
})
</script>

<style scoped>
.post-card-skeleton {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 2px solid transparent;
  margin-bottom: 32px;
  padding: 28px 36px 24px 36px;
  width: 100%;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  overflow: hidden;
}

.skeleton-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-username {
  width: 120px;
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-meta {
  width: 80px;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-extra {
  width: 60px;
  height: 24px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 16px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-line-long {
  width: 100%;
}

.skeleton-line-medium {
  width: 75%;
}

.skeleton-line-short {
  width: 50%;
}

.skeleton-images {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
}

.skeleton-images[data-count="1"] {
  grid-template-columns: 1fr;
  max-width: 300px;
}

.skeleton-images[data-count="2"] {
  grid-template-columns: repeat(2, 1fr);
  max-width: 400px;
}

.skeleton-images[data-count="3"] {
  grid-template-columns: repeat(3, 1fr);
  max-width: 450px;
}

.skeleton-images[data-count="4"] {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  max-width: 400px;
}

.skeleton-image {
  aspect-ratio: 1;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.skeleton-action-btn {
  width: 80px;
  height: 36px;
  border-radius: 18px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .post-card-skeleton {
    padding: 16px 20px 12px 20px;
    margin-bottom: 20px;
  }
  
  .skeleton-avatar {
    width: 40px;
    height: 40px;
  }
  
  .skeleton-username {
    width: 100px;
    height: 14px;
  }
  
  .skeleton-meta {
    width: 70px;
    height: 10px;
  }
  
  .skeleton-images {
    grid-template-columns: 1fr !important;
    max-width: 100% !important;
  }
}
</style>
