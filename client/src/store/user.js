import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => {
    console.log('=== 创建用户 store 状态 ===')
    return {
      token: '',
      user: null,
      initialized: false
    }
  },
  actions: {
    setUser(token, user) {
      console.log('设置用户数据:', { token: token ? '存在' : '不存在', user })
      this.token = token
      this.user = user
      try {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      } catch (error) {
        console.warn('Failed to save user data to localStorage:', error)
      }
    },
    logout() {
      console.log('用户登出')
      this.token = ''
      this.user = null
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch (error) {
        console.warn('Failed to remove user data from localStorage:', error)
      }
    },
    initFromStorage() {
      if (this.initialized) {
        console.log('用户 store 已经初始化过，跳过')
        return
      }
      
      try {
        console.log('=== 初始化用户存储 ===')
        
        // 检查 localStorage 是否可用
        if (typeof localStorage === 'undefined') {
          console.log('localStorage 不可用，跳过初始化')
          this.initialized = true
          return
        }
        
        const token = localStorage.getItem('token') || ''
        const userStr = localStorage.getItem('user')
        
        console.log('localStorage token:', token)
        console.log('localStorage user:', userStr)
        console.log('userStr类型:', typeof userStr)
        
        let user = null
        
        if (userStr && userStr !== 'undefined' && userStr !== 'null' && userStr !== '') {
          console.log('尝试解析用户数据:', userStr)
          user = JSON.parse(userStr)
          console.log('解析成功，用户数据:', user)
        } else {
          console.log('用户数据为空或无效，跳过解析')
        }
        
        this.token = token
        this.user = user
        this.initialized = true
        
        console.log('初始化完成 - token:', this.token, 'user:', this.user, 'initialized:', this.initialized)
      } catch (error) {
        console.error('初始化用户存储失败:', error)
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack
        })
        this.token = ''
        this.user = null
        this.initialized = true
      }
    }
  }
}) 