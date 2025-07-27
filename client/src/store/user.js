import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    console.log('=== 创建用户 store 状态 ===')
    return {
      token: '',
      user: null,
      initialized: false,
      rememberMe: false,
      tokenExpiry: null,
      lastActivity: null
    }
  },
  
  getters: {
    // 检查用户是否已登录
    isLoggedIn: (state) => {
      return !!state.token && !!state.user
    },
    
    // 检查 token 是否过期
    isTokenExpired: (state) => {
      if (!state.tokenExpiry) return false
      return new Date() > new Date(state.tokenExpiry)
    },
    
    // 获取用户昵称或用户名
    displayName: (state) => {
      if (!state.user) return ''
      return state.user.nickname || state.user.username || '未知用户'
    },
    
    // 获取用户头像
    avatar: (state) => {
      if (!state.user) return ''
      return state.user.avatar_url || ''
    },
    
    // 检查是否需要自动登录
    shouldAutoLogin: (state) => {
      if (!state.rememberMe) return false
      if (!state.tokenExpiry) return false
      return new Date() <= new Date(state.tokenExpiry)
    }
  },
  
  actions: {
    // 设置用户数据
    setUser(token, user, rememberMe = false) {
      console.log('设置用户数据:', { 
        token: token ? '存在' : '不存在', 
        user, 
        rememberMe 
      })
      
      this.token = token
      this.user = user
      this.rememberMe = rememberMe
      
      // 设置 token 过期时间
      if (token && rememberMe) {
        // 记住我：7天过期
        this.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      } else if (token) {
        // 普通登录：1小时过期
        this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000)
      } else {
        this.tokenExpiry = null
      }
      
      this.lastActivity = new Date()
      
      // 保存到 localStorage
      this.saveToStorage()
    },
    
    // 登出
    logout() {
      console.log('用户登出')
      this.token = ''
      this.user = null
      this.rememberMe = false
      this.tokenExpiry = null
      this.lastActivity = null
      
      // 清除 localStorage
      this.clearStorage()
    },
    
    // 更新用户信息
    updateUser(userData) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
        this.saveToStorage()
        console.log('用户信息已更新:', this.user)
      }
    },
    
    // 更新用户头像
    updateAvatar(avatarUrl) {
      if (this.user) {
        this.user.avatar_url = avatarUrl
        this.saveToStorage()
        console.log('用户头像已更新:', avatarUrl)
      }
    },
    
    // 刷新用户活动时间
    refreshActivity() {
      this.lastActivity = new Date()
      this.saveToStorage()
    },
    
    // 检查并处理 token 过期
    checkTokenExpiry() {
      if (this.isTokenExpired) {
        console.log('Token 已过期，自动登出')
        this.logout()
        return false
      }
      return true
    },
    
    // 保存到 localStorage
    saveToStorage() {
      try {
        if (typeof localStorage === 'undefined') return
        
        const data = {
          token: this.token,
          user: this.user,
          rememberMe: this.rememberMe,
          tokenExpiry: this.tokenExpiry,
          lastActivity: this.lastActivity
        }
        
        localStorage.setItem('userStore', JSON.stringify(data))
        console.log('用户数据已保存到 localStorage')
      } catch (error) {
        console.warn('Failed to save user data to localStorage:', error)
      }
    },
    
    // 从 localStorage 加载
    loadFromStorage() {
      try {
        if (typeof localStorage === 'undefined') return false
        
        const dataStr = localStorage.getItem('userStore')
        if (!dataStr) return false
        
        const data = JSON.parse(dataStr)
        
        // 检查数据完整性
        if (!data.token || !data.user) {
          console.log('localStorage 数据不完整，清除')
          this.clearStorage()
          return false
        }
        
        // 检查 token 是否过期
        if (data.tokenExpiry && new Date() > new Date(data.tokenExpiry)) {
          console.log('localStorage 中的 token 已过期，清除')
          this.clearStorage()
          return false
        }
        
        // 恢复数据
        this.token = data.token
        this.user = data.user
        this.rememberMe = data.rememberMe || false
        this.tokenExpiry = data.tokenExpiry ? new Date(data.tokenExpiry) : null
        this.lastActivity = data.lastActivity ? new Date(data.lastActivity) : null
        
        console.log('从 localStorage 恢复用户数据成功')
        return true
        
      } catch (error) {
        console.error('从 localStorage 加载用户数据失败:', error)
        this.clearStorage()
        return false
      }
    },
    
    // 清除 localStorage
    clearStorage() {
      try {
        if (typeof localStorage === 'undefined') return
        
        localStorage.removeItem('userStore')
        localStorage.removeItem('token') // 兼容旧版本
        localStorage.removeItem('user') // 兼容旧版本
        console.log('localStorage 已清除')
      } catch (error) {
        console.warn('Failed to clear localStorage:', error)
      }
    },
    
    // 初始化 store
    initFromStorage() {
      if (this.initialized) {
        console.log('用户 store 已经初始化过，跳过')
        return
      }
      
      console.log('=== 初始化用户存储 ===')
      
      // 尝试从 localStorage 加载
      const loaded = this.loadFromStorage()
      
      if (loaded) {
        console.log('成功从 localStorage 恢复用户状态')
      } else {
        console.log('localStorage 中无有效用户数据')
      }
      
      this.initialized = true
      console.log('初始化完成 - 登录状态:', this.isLoggedIn)
    },
    
    // 设置记住我状态
    setRememberMe(rememberMe) {
      this.rememberMe = rememberMe
      this.saveToStorage()
      console.log('记住我状态已更新:', rememberMe)
    }
  }
}) 