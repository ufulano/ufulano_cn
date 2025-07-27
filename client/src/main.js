import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import pinia from './store'
import { useUserStore } from './store/user'
import './assets/theme.css'
import './utils/debugTools.js'

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

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
const userStore = useUserStore()
userStore.initFromStorage()
console.log('用户状态初始化完成')

// 定期检查 token 过期
setInterval(() => {
  if (userStore.isLoggedIn) {
    userStore.checkTokenExpiry()
  }
}, 60000) // 每分钟检查一次

console.log('准备挂载应用到 DOM...')
app.mount('#app')
console.log('应用挂载完成')
