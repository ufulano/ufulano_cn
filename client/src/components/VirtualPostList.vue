<template>
  <!-- 虚拟列表容器 -->
  <div class="virtual-list-container" ref="containerRef">
    <!-- 虚拟占位元素，用于撑开滚动条 -->
    <div 
      class="virtual-list-phantom" 
      :style="{ height: totalHeight + 'px' }"
    ></div>
    <!-- 实际内容容器 -->
    <div 
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <!-- 可见的项目列表 -->
      <div 
        v-for="item in visibleItems" 
        :key="item.id || item._id || item.index"
        class="virtual-list-item"
        :ref="el => setItemRef(el, item.id || item._id || item.index)"
        :data-item-id="item.id || item._id || item.index"
      >
        <slot :item="item" :index="item.index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 虚拟列表组件
 * 
 * 功能：
 * - 高性能渲染大量数据
 * - 只渲染可见区域的项目
 * - 动态计算项目高度
 * - 支持滚动定位
 * - 缓冲区优化
 * 
 * 特性：
 * - 虚拟滚动
 * - 动态高度
 * - 性能优化
 * - 响应式设计
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

/**
 * 组件属性定义
 */
const props = defineProps({
  /** 要渲染的项目数组 */
  items: {
    type: Array,
    default: () => []
  },
  /** 预估的项目高度 */
  estimatedItemHeight: {
    type: Number,
    default: 300
  },
  /** 缓冲区大小 */
  bufferSize: {
    type: Number,
    default: 5
  }
})

// 组件内部状态
/** 容器DOM引用 */
const containerRef = ref(null)
/** 滚动位置 */
const scrollTop = ref(0)
/** 容器高度 */
const containerHeight = ref(0)
/** 存储每个item的实际高度 */
const itemHeights = ref(new Map())
/** 存储DOM引用 */
const itemRefs = ref(new Map())

/**
 * 设置item引用
 * 当DOM元素挂载时，保存引用并更新高度
 * 
 * @param {HTMLElement} el - DOM元素
 * @param {string|number} itemId - 项目ID
 */
const setItemRef = (el, itemId) => {
  if (el) {
    itemRefs.value.set(itemId, el)
    // 测量并更新高度
    nextTick(() => {
      updateItemHeight(itemId, el)
    })
  }
}

/**
 * 更新单个item的高度
 * 
 * @param {string|number} itemId - 项目ID
 * @param {HTMLElement} element - DOM元素
 */
const updateItemHeight = (itemId, element) => {
  if (!element) return
  
  const height = element.offsetHeight
  const oldHeight = itemHeights.value.get(itemId) || 0
  
  if (height !== oldHeight) {
    itemHeights.value.set(itemId, height)
    console.log(`Item ${itemId} height updated: ${oldHeight} -> ${height}`)
  }
}

/**
 * 获取item的累积高度
 * 计算指定索引之前所有项目的高度总和
 * 
 * @param {number} index - 项目索引
 * @returns {number} 累积高度
 */
const getItemOffset = (index) => {
  if (!props.items || !Array.isArray(props.items)) return 0;
  let offset = 0;
  for (let i = 0; i < index; i++) {
    const item = props.items[i];
    if (item && typeof item === 'object') {
      const itemId = item.id || item._id || i;
      offset += itemHeights.value.get(itemId) || props.estimatedItemHeight;
    } else {
      offset += props.estimatedItemHeight;
    }
  }
  return offset;
}

/**
 * 计算总高度
 * 计算所有项目的总高度，用于虚拟占位元素
 */
const totalHeight = computed(() => {
  if (!props.items || !Array.isArray(props.items)) return 0;
  let total = 0
  props.items.forEach((item, index) => {
    if (item && typeof item === 'object') {
      const itemId = item.id || item._id || index;
      total += itemHeights.value.get(itemId) || props.estimatedItemHeight
    } else {
      total += props.estimatedItemHeight
    }
  })
  return total
})

/**
 * 计算可见区域
 * 根据当前滚动位置计算需要渲染的项目范围
 */
const visibleRange = computed(() => {
  const start = findStartIndex(scrollTop.value)
  const end = findEndIndex(start, containerHeight.value)
  
  return {
    start: Math.max(0, start - props.bufferSize),
    end: Math.min(props.items.length, end + props.bufferSize)
  }
})

/**
 * 查找起始索引
 * 根据滚动位置找到第一个可见项目的索引
 * 
 * @param {number} scrollTop - 滚动位置
 * @returns {number} 起始索引
 */
const findStartIndex = (scrollTop) => {
  if (!props.items || !Array.isArray(props.items)) return 0;
  let index = 0;
  let offset = 0;
  for (let i = 0; i < props.items.length; i++) {
    const item = props.items[i];
    if (!item || typeof item !== 'object') {
      offset += props.estimatedItemHeight;
      continue;
    }
    const itemId = item.id || item._id || i;
    const itemHeight = itemHeights.value.get(itemId) || props.estimatedItemHeight;
    if (offset + itemHeight > scrollTop) {
      return i;
    }
    offset += itemHeight;
  }
  return props.items.length - 1;
}

/**
 * 查找结束索引
 * 根据起始索引和容器高度找到最后一个可见项目的索引
 * 
 * @param {number} startIndex - 起始索引
 * @param {number} containerHeight - 容器高度
 * @returns {number} 结束索引
 */
const findEndIndex = (startIndex, containerHeight) => {
  if (!props.items || !Array.isArray(props.items)) return 0;
  let index = startIndex;
  let offset = getItemOffset(startIndex);
  while (index < props.items.length && offset < scrollTop.value + containerHeight) {
    const item = props.items[index];
    if (item && typeof item === 'object') {
      const itemId = item.id || item._id || index;
      offset += itemHeights.value.get(itemId) || props.estimatedItemHeight;
    } else {
      offset += props.estimatedItemHeight;
    }
    index++;
  }
  return index;
}

/**
 * 计算偏移量
 * 计算内容容器的Y轴偏移量，用于定位可见项目
 */
const offsetY = computed(() => {
  return getItemOffset(visibleRange.value.start)
})

/**
 * 可见的项目
 * 根据可见范围计算需要渲染的项目列表
 */
const visibleItems = computed(() => {
  if (!props.items || !Array.isArray(props.items)) return [];
  const { start, end } = visibleRange.value;
  console.log('VirtualPostList - 可见范围:', { start, end, totalItems: props.items.length });
  
  const slicedItems = props.items.slice(start, end);
  console.log('VirtualPostList - 切片后的项目:', slicedItems);
  
  const filteredItems = slicedItems.filter(item => item && typeof item === 'object');
  console.log('VirtualPostList - 过滤后的项目:', filteredItems);
  
  return filteredItems.map((item, index) => ({
    ...item,
    index: start + index
  }));
});

/**
 * 滚动处理函数
 * 更新当前滚动位置
 */
const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

/**
 * 监听容器大小变化
 * 更新容器高度信息
 */
const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

/**
 * 监听项目变化
 * 当项目数组变化时重新计算高度
 */
watch(() => props.items, () => {
  // 项目变化时重新计算高度
  nextTick(() => {
    updateAllItemHeights()
  })
}, { deep: true })

/**
 * 更新所有item高度
 * 遍历所有已渲染的项目并更新其高度
 */
const updateAllItemHeights = () => {
  itemRefs.value.forEach((element, itemId) => {
    updateItemHeight(itemId, element)
  })
}

/**
 * 使用 ResizeObserver 监听元素大小变化
 * 用于监听项目高度变化并更新缓存
 */
let resizeObserver = null

/**
 * 组件挂载时的初始化
 * 设置事件监听器和ResizeObserver
 */
onMounted(() => {
  updateContainerHeight()
  window.addEventListener('resize', updateContainerHeight)
  
  // 添加滚动监听
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
  }
  
  // 设置 ResizeObserver
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        const itemId = entry.target.dataset.itemId
        if (itemId) {
          updateItemHeight(itemId, entry.target)
        }
      })
    })
  }
})

/**
 * 组件卸载时的清理
 * 移除事件监听器和ResizeObserver
 */
onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

/**
 * 监听滚动位置变化
 * 滚动时更新可见区域
 */
watch(() => scrollTop.value, () => {
  // 滚动时更新可见区域
}, { flush: 'post' })

/**
 * 暴露方法给父组件
 * 提供更新高度和滚动定位功能
 */
defineExpose({
  updateAllItemHeights,
  scrollToItem: (index) => {
    if (containerRef.value) {
      const offset = getItemOffset(index)
      containerRef.value.scrollTop = offset
    }
  }
})
</script>

<style scoped>
.virtual-list-container {
  position: relative;
  overflow-y: auto;
  height: 100%;
}

.virtual-list-phantom {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.virtual-list-item {
  width: 100%;
}
</style> 