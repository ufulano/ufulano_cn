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
  const userStore = useUserStore()
  // 允许未登录访问的页面
  const publicPages = ['/', '/login', '/register', '/community', /^\/post\//]
  const isPublic = publicPages.some(p => typeof p === 'string' ? to.path === p : p.test(to.path))
  if (!isPublic && !userStore.token) {
    return next('/login')
  }
  next()
})

export default router 