import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import pinia from './store'
import { useUserStore } from './store/user'
import './assets/theme.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(pinia)
app.use(router)

// 初始化用户状态
const userStore = useUserStore()
userStore.initFromStorage()

app.mount('#app')
