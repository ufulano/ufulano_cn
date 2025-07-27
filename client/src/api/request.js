import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getCache, setCache, deleteCache } from '../utils/cacheManager'

const service = axios.create({
  baseURL: '/api', // 代理到后端
  timeout: 60000, // 增加超时时间到60秒，适应图片上传
})

// 请求拦截器，自动携带 token 和缓存处理
service.interceptors.request.use(config => {
  console.log('=== 请求拦截器 ===')
  console.log('请求方法:', config.method?.toUpperCase())
  console.log('请求URL:', config.url)
  console.log('完整URL:', config.baseURL + config.url)
  
  // 检查缓存（仅对GET请求）
  if (config.method?.toLowerCase() === 'get' && !config.noCache) {
    const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`
    const cachedData = getCache(cacheKey)
    if (cachedData) {
      console.log('使用缓存数据:', cacheKey)
      return Promise.resolve({ data: cachedData, fromCache: true })
    }
  }
  
  // 尝试从新的 userStore 格式获取 token
  let token = null
  try {
    const userStoreData = localStorage.getItem('userStore')
    if (userStoreData) {
      const data = JSON.parse(userStoreData)
      token = data.token
      console.log('从 userStore 获取到 token:', token ? '存在' : '不存在')
    }
  } catch (error) {
    console.log('解析 userStore 失败，尝试旧格式')
  }
  
  // 如果新格式没有，尝试旧格式
  if (!token) {
    token = localStorage.getItem('token')
    console.log('从旧格式获取到 token:', token ? '存在' : '不存在')
  }
  
  console.log('最终使用的 token:', token ? '存在' : '不存在')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('已添加Authorization头')
  }
  
  console.log('最终请求配置:', config)
  return config
}, error => {
  console.error('请求拦截器错误:', error)
  return Promise.reject(error)
})

// 响应拦截器，统一错误处理和缓存
service.interceptors.response.use(
  response => {
    console.log('=== 响应拦截器成功 ===')
    
    // 处理缓存数据
    if (response.fromCache) {
      console.log('返回缓存数据')
      return response.data
    }
    
    // 缓存GET请求的响应数据
    if (response.config.method?.toLowerCase() === 'get' && !response.config.noCache) {
      const cacheKey = `${response.config.url}_${JSON.stringify(response.config.params || {})}`
      setCache(cacheKey, response.data)
      console.log('已缓存数据:', cacheKey)
    }
    
    console.log('响应状态:', response.status)
    console.log('响应数据:', response.data)
    return response.data
  },
  error => {
    console.error('=== 响应拦截器错误 ===')
    console.error('错误对象:', error)
    console.error('错误消息:', error.message)
    
    if (error.response) {
      console.error('错误响应状态:', error.response.status)
      console.error('错误响应数据:', error.response.data)
      console.error('错误响应头:', error.response.headers)
      
      if (error.response.status === 401) {
        console.error('401未授权错误，跳转到登录页')
        ElMessage.error('请先登录')
        window.location.href = '/login'
      } else if (error.response.status === 413) {
        console.error('413请求体过大错误')
        ElMessage.error('图片数据过大，请压缩图片后重试')
      } else {
        console.error('其他HTTP错误')
        ElMessage.error(error.response.data.message || '请求出错')
      }
    } else if (error.request) {
      console.error('请求已发送但没有收到响应')
      console.error('请求配置:', error.request)
      ElMessage.error('网络错误：服务器无响应')
    } else {
      console.error('请求配置错误')
      console.error('错误配置:', error.config)
      ElMessage.error('网络错误：请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default service 