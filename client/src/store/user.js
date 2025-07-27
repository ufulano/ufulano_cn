import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null
  }),
  actions: {
    setUser(token, user) {
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
      try {
        const token = localStorage.getItem('token') || ''
        const userStr = localStorage.getItem('user')
        let user = null
        
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          user = JSON.parse(userStr)
        }
        
        this.token = token
        this.user = user
      } catch (error) {
        console.warn('Failed to load user data from localStorage:', error)
        this.token = ''
        this.user = null
      }
    }
  }
}) 