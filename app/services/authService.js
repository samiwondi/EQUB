import { api } from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data),

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken)
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
}