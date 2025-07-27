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
    
    // 获取用户ID
    userId: (state) => {
      if (!state.user) return null
      return state.user.user_id || state.user.id || null
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
      console.log('=== setUser 方法调用 ===')
      console.log('传入的 token:', token ? '存在' : '不存在')
      console.log('传入的 user:', user)
      console.log('传入的 rememberMe:', rememberMe)
      
      if (!token) {
        console.error('❌ token 为空！')
        return
      }
      
      if (!user) {
        console.error('❌ user 数据为空！')
        return
      }
      
      this.token = token
      this.user = user
      this.rememberMe = rememberMe
      
      console.log('✅ 用户数据已设置到 store')
      console.log('当前 store 状态:', {
        token: this.token ? '存在' : '不存在',
        user: this.user ? '存在' : '不存在',
        isLoggedIn: this.isLoggedIn
      })
      
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
        
        // 首先尝试加载新格式的数据
        const dataStr = localStorage.getItem('userStore')
        if (dataStr) {
          try {
            const data = JSON.parse(dataStr)
            console.log('解析新格式数据:', data)
            
            // 检查数据完整性
            if (!data.token || !data.user) {
              console.log('新格式 localStorage 数据不完整，尝试旧格式')
            } else {
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
              
              console.log('从新格式 localStorage 恢复用户数据成功')
              console.log('恢复的 token:', this.token ? '存在' : '不存在')
              console.log('恢复的 user:', this.user)
              return true
            }
          } catch (parseError) {
            console.error('解析新格式数据失败:', parseError)
          }
        }
        
        // 尝试加载旧格式的数据（兼容性）
        const oldToken = localStorage.getItem('token')
        const oldUserStr = localStorage.getItem('user')
        
        console.log('检查旧格式数据:', { oldToken: oldToken ? '存在' : '不存在', oldUserStr })
        
        if (oldToken && oldUserStr) {
          try {
            const oldUser = JSON.parse(oldUserStr)
            console.log('解析旧格式用户数据:', oldUser)
            
            if (oldUser && typeof oldUser === 'object') {
              this.token = oldToken
              this.user = oldUser
              this.rememberMe = false // 旧格式默认不记住
              this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1小时过期
              this.lastActivity = new Date()
              
              // 迁移到新格式
              this.saveToStorage()
              
              console.log('从旧格式 localStorage 恢复用户数据成功，已迁移到新格式')
              console.log('恢复的 token:', this.token ? '存在' : '不存在')
              console.log('恢复的 user:', this.user)
              return true
            } else {
              console.log('旧格式用户数据无效:', oldUser)
            }
          } catch (parseError) {
            console.error('解析旧格式用户数据失败:', parseError)
          }
        } else {
          console.log('旧格式数据不完整:', { oldToken: !!oldToken, oldUserStr: !!oldUserStr })
        }
        
        console.log('localStorage 中无有效用户数据')
        return false
        
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
      
      // 验证和修复用户数据
      this.validateAndFixUserData()
      
      this.initialized = true
      console.log('初始化完成 - 登录状态:', this.isLoggedIn)
    },
    
    // 设置记住我状态
    setRememberMe(rememberMe) {
      this.rememberMe = rememberMe
      this.saveToStorage()
      console.log('记住我状态已更新:', rememberMe)
    },
    
    // 验证和修复用户数据
    validateAndFixUserData() {
      console.log('=== 验证和修复用户数据 ===')
      
      // 检查是否有 token 但没有用户数据
      if (this.token && !this.user) {
        console.log('发现 token 存在但用户数据缺失，尝试修复...')
        
        // 尝试从旧格式恢复
        const oldUserStr = localStorage.getItem('user')
        if (oldUserStr) {
          try {
            const oldUser = JSON.parse(oldUserStr)
            if (oldUser && typeof oldUser === 'object') {
              this.user = oldUser
              this.saveToStorage()
              console.log('成功修复用户数据')
              return true
            }
          } catch (error) {
            console.error('修复用户数据失败:', error)
          }
        }
        
        // 如果无法修复，清除无效数据
        console.log('无法修复用户数据，清除无效 token')
        this.logout()
        return false
      }
      
      // 检查是否有用户数据但没有 token
      if (!this.token && this.user) {
        console.log('发现用户数据存在但 token 缺失，清除无效数据')
        this.logout()
        return false
      }
      
      console.log('用户数据验证通过')
      return true
    },
    
    // 强制重新加载用户数据
    forceReload() {
      console.log('=== 强制重新加载用户数据 ===')
      
      // 清除当前状态
      this.token = ''
      this.user = null
      this.rememberMe = false
      this.tokenExpiry = null
      this.lastActivity = null
      
      // 重新加载
      const loaded = this.loadFromStorage()
      
      if (loaded) {
        console.log('强制重新加载成功')
        console.log('当前状态:', {
          token: this.token ? '存在' : '不存在',
          user: this.user ? '存在' : '不存在',
          isLoggedIn: this.isLoggedIn
        })
      } else {
        console.log('强制重新加载失败')
      }
      
      return loaded
    }
  }
}) 