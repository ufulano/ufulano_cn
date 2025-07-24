import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/post/new', name: 'NewPost', component: () => import('../views/NewPost.vue') },
  { path: '/post/:id', name: 'PostDetail', component: () => import('../views/PostDetail.vue') },
  { path: '/user/:id', name: 'UserProfile', component: () => import('../views/UserProfile.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 