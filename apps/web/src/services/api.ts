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

export const formsApi = {
  list: () => apiClient.get('/forms/'),
  create: (data: { form_type: string; form_data?: object }) =>
    apiClient.post('/forms/', data),
  get: (id: number) => apiClient.get(`/forms/${id}`),
  update: (id: number, form_data: object) =>
    apiClient.put(`/forms/${id}`, { form_data }),
  submit: (id: number) => apiClient.post(`/forms/${id}/submit`),
  review: (id: number, status: string, admin_notes?: string) =>
    apiClient.patch(`/forms/${id}/review`, { status, admin_notes }),
  uploadDocument: (id: number, document_type: string, file: File) => {
    const fd = new FormData()
    fd.append('document_type', document_type)
    fd.append('file', file)
    const token = useAuthStore.getState().token
    return axios.post(`${BASE_URL}/forms/${id}/documents`, fd, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
  },
  listDocuments: (id: number) => apiClient.get(`/forms/${id}/documents`),
}

export const livelihoodUpdatesApi = {
  list: () => apiClient.get('/livelihood-updates/'),
  create: (data: { title: string; description?: string; program_id?: number; file?: File }) => {
    const fd = new FormData()
    fd.append('title', data.title)
    if (data.description) fd.append('description', data.description)
    if (data.program_id) fd.append('program_id', String(data.program_id))
    if (data.file) fd.append('file', data.file)
    const token = useAuthStore.getState().token
    return axios.post(`${BASE_URL}/livelihood-updates/`, fd, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    })
  },
  get: (id: number) => apiClient.get(`/livelihood-updates/${id}`),
  review: (id: number, admin_notes: string) =>
    apiClient.patch(`/livelihood-updates/${id}/review`, { admin_notes }),
}

export const messagesApi = {
  staff: () => apiClient.get('/messages/staff'),
  conversations: () => apiClient.get('/messages/conversations'),
  getWith: (partnerId: number) => apiClient.get(`/messages/with/${partnerId}`),
  send: (receiver_id: number, content: string) =>
    apiClient.post('/messages/', { receiver_id, content }),
  unreadCount: () => apiClient.get('/messages/unread-count'),
}
