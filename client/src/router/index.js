import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../store/user'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/community', name: 'Community', component: () => import('../views/Community.vue') },
  { path: '/post/new', name: 'NewPost', component: () => import('../views/NewPost.vue') },
  { path: '/post/:id', name: 'PostDetail', component: () => import('../views/PostDetail.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  try {
    console.log('=== 路由守卫 ===')
    console.log('目标路由:', to.path)
    console.log('来源路由:', from.path)
    
    const userStore = useUserStore()
    console.log('用户 store 获取成功')
    console.log('当前 token:', userStore.token ? '存在' : '不存在')
    
    // 允许未登录访问的页面
    const publicPages = ['/', '/login', '/register', '/community', /^\/post\//]
    const isPublic = publicPages.some(p => typeof p === 'string' ? to.path === p : p.test(to.path))
    
    console.log('是否为公开页面:', isPublic)
    
    if (!isPublic && !userStore.token) {
      console.log('需要登录，重定向到登录页')
      return next('/login')
    }
    
    console.log('路由守卫通过')
    next()
  } catch (error) {
    console.error('路由守卫错误:', error)
    // 如果出现错误，允许访问（避免阻塞应用）
    next()
  }
})

export default router 