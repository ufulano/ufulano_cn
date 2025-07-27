// Service Worker for caching and performance optimization
const CACHE_NAME = 'ufulano-cache-v1'
const STATIC_CACHE = 'ufulano-static-v1'
const API_CACHE = 'ufulano-api-v1'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html'
]

// 需要缓存的API路径
const API_PATHS = [
  '/api/posts',
  '/api/user'
]

// 安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static assets')
        // 只缓存主页，其他资源按需缓存
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(error => {
        console.log('缓存静态资源失败:', error)
        // 即使缓存失败也继续安装
      })
      .then(() => self.skipWaiting())
  )
})

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// 拦截请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只缓存主页
  if (request.method === 'GET' && url.pathname === '/') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response
          }
          return fetch(request)
        })
        .catch(() => {
          // 如果缓存和网络都失败，返回离线页面
          return caches.match('/index.html')
        })
    )
  }
  
  // API请求不缓存，直接通过
  if (request.method === 'GET' && isApiRequest(url.pathname)) {
    event.respondWith(fetch(request))
  }
})

// 判断是否为静态资源
function isStaticAsset(pathname) {
  return pathname.startsWith('/assets/') || 
         pathname === '/' || 
         pathname === '/index.html' ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css')
}

// 判断是否为API请求
function isApiRequest(pathname) {
  return API_PATHS.some(path => pathname.startsWith(path))
}

// 消息处理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
}) 