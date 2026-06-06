import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login/json', { email, password }),
  register: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
    barangay?: string
  }) => apiClient.post('/auth/register', data),
  me: () => apiClient.get('/auth/me'),
}

export const programsApi = {
  list: () => apiClient.get('/programs/'),
  get: (id: number) => apiClient.get(`/programs/${id}`),
  create: (data: object) => apiClient.post('/programs/', data),
  update: (id: number, data: object) => apiClient.put(`/programs/${id}`, data),
  delete: (id: number) => apiClient.delete(`/programs/${id}`),
}

export const applicationsApi = {
  list: () => apiClient.get('/applications/'),
  create: (data: object) => apiClient.post('/applications/', data),
  review: (id: number, status: string, notes?: string) =>
    apiClient.patch(`/applications/${id}/review`, { status, notes }),
  withdraw: (id: number) => apiClient.delete(`/applications/${id}`),
}

export const adminApi = {
  stats: () => apiClient.get('/admin/stats'),
  recentApplications: () => apiClient.get('/admin/recent-applications'),
}

export const usersApi = {
  list: () => apiClient.get('/users/'),
  pending: () => apiClient.get('/users/pending'),
  create: (data: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
    barangay?: string
    role?: string
  }) => apiClient.post('/users/create', data),
  approve: (id: number) => apiClient.patch(`/users/${id}/approve`),
  reject: (id: number) => apiClient.patch(`/users/${id}/reject`),
  update: (id: number, data: object) => apiClient.put(`/users/${id}`, data),
  updateRole: (id: number, role: string) =>
    apiClient.patch(`/users/${id}/role?role=${role}`),
  toggleActive: (id: number) => apiClient.patch(`/users/${id}/toggle-active`),
}
