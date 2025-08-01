<template>
  <div class="virtual-list-container" ref="containerRef">
    <div 
      class="virtual-list-phantom" 
      :style="{ height: totalHeight + 'px' }"
    ></div>
    <div 
      class="virtual-list-content"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  estimatedItemHeight: {
    type: Number,
    default: 300
  },
  bufferSize: {
    type: Number,
    default: 5
  }
})

const containerRef = ref(null)
const scrollTop = ref(0)
const containerHeight = ref(0)
const itemHeights = ref(new Map()) // 存储每个item的实际高度
const itemRefs = ref(new Map()) // 存储DOM引用

// 设置item引用
const setItemRef = (el, itemId) => {
  if (el) {
    itemRefs.value.set(itemId, el)
    // 测量并更新高度
    nextTick(() => {
      updateItemHeight(itemId, el)
    })
  }
}

// 更新单个item的高度
const updateItemHeight = (itemId, element) => {
  if (!element) return
  
  const height = element.offsetHeight
  const oldHeight = itemHeights.value.get(itemId) || 0
  
  if (height !== oldHeight) {
    itemHeights.value.set(itemId, height)
    console.log(`Item ${itemId} height updated: ${oldHeight} -> ${height}`)
  }
}

// 获取item的累积高度
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

// 计算总高度
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

// 计算可见区域
const visibleRange = computed(() => {
  const start = findStartIndex(scrollTop.value)
  const end = findEndIndex(start, containerHeight.value)
  
  return {
    start: Math.max(0, start - props.bufferSize),
    end: Math.min(props.items.length, end + props.bufferSize)
  }
})

// 查找起始索引
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

// 查找结束索引
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

// 计算偏移量
const offsetY = computed(() => {
  return getItemOffset(visibleRange.value.start)
})

// 可见的项目
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

// 滚动处理
const handleScroll = () => {
  if (containerRef.value) {
    scrollTop.value = containerRef.value.scrollTop
  }
}

// 监听容器大小变化
const updateContainerHeight = () => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
}

// 监听项目变化
watch(() => props.items, () => {
  // 项目变化时重新计算高度
  nextTick(() => {
    updateAllItemHeights()
  })
}, { deep: true })

// 更新所有item高度
const updateAllItemHeights = () => {
  itemRefs.value.forEach((element, itemId) => {
    updateItemHeight(itemId, element)
  })
}

// 使用 ResizeObserver 监听元素大小变化
let resizeObserver = null

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

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
  if (containerRef.value) {
    containerRef.value.removeEventListener('scroll', handleScroll)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// 监听滚动
watch(() => scrollTop.value, () => {
  // 滚动时更新可见区域
}, { flush: 'post' })

// 暴露方法给父组件
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