import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getCache, setCache, deleteCache } from '../utils/cacheManager'

const service = axios.create({
  baseURL: '/api', // 代理到后端
  timeout: 60000, // 增加超时时间到60秒，适应图片上传
})

// 请求拦截器，自动携带 token 和缓存处理
service.interceptors.request.use(config => {
  // 确保 config 存在
  if (!config) {
    return Promise.reject(new Error('请求配置为空'))
  }
  
  // 检查缓存（仅对GET请求）
  const method = config.method || 'GET'
  if (method.toLowerCase() === 'get' && !config.noCache) {
    const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      return Promise.resolve({ data: cachedData, fromCache: true })
    }
  }
  
  // 获取用户token
  let token = null
  try {
    const userStoreData = localStorage.getItem('userStore')
    if (userStoreData) {
      const data = JSON.parse(userStoreData)
      token = data.token
    }
  } catch (error) {
    // 解析失败，尝试旧格式
  }
  
  // 如果新格式没有，尝试旧格式
  if (!token) {
    token = localStorage.getItem('token')
  }
  
  // 添加Authorization头
  if (token) {
    if (!config.headers) {
      config.headers = {}
    }
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器，统一错误处理和缓存
service.interceptors.response.use(
  response => {
    // 处理缓存数据
    if (response.fromCache) {
      return response.data
    }
    
    // 缓存GET请求的响应数据
    if (response.config && response.config.method && response.config.method.toLowerCase() === 'get' && !response.config.noCache) {
      const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params || {})}`
      setCache(cacheKey, response.data)
    }
    
    return response.data
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        ElMessage.error('请先登录')
        window.location.href = '/login'
      } else if (error.response.status === 413) {
        ElMessage.error('图片数据过大，请压缩图片后重试')
      } else {
        ElMessage.error(error.response.data.message || '请求出错')
      }
    } else if (error.request) {
      ElMessage.error('网络错误：服务器无响应')
    } else {
      ElMessage.error('网络错误：请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service 