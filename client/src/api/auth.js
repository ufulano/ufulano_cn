import request from './request'

// 登录
export function login(data) {
  return request.post('/auth/login', data)
}
// 注册
export function register(data) {
  return request.post('/auth/register', data)
} 