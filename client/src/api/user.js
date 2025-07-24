import request from './request'

export function fetchCurrentUser() {
  return request.get('/auth/me')
}

export function fetchUserPosts(username) {
  return request.get('/posts', { params: { username } })
}

export function fetchUserLikeHistory() {
  return request.get('/likes/user/history')
} 