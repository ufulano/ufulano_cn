import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import pinia from './store'
import { useUserStore } from './store/user'
import './assets/theme.css'

console.log('=== 应用启动 ===')
console.log('开始创建 Vue 应用...')

const app = createApp(App)
console.log('Vue 应用创建成功')

app.use(ElementPlus)
console.log('ElementPlus 已加载')

app.use(pinia)
console.log('Pinia 已加载')

app.use(router)
console.log('Router 已加载')

// 初始化用户状态
console.log('准备初始化用户状态...')
setTimeout(() => {
  try {
    const userStore = useUserStore()
    console.log('用户 store 获取成功')
    userStore.initFromStorage()
    console.log('用户状态初始化完成')
  } catch (error) {
    console.error('用户状态初始化失败:', error)
  }
}, 100) // 延迟100ms确保Pinia完全初始化

console.log('准备挂载应用到 DOM...')
app.mount('#app')
console.log('应用挂载完成')
