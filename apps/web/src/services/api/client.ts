import axios from 'axios'
import { auth } from '../firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD 
    ? 'https://fastapi-production-9cc0.up.railway.app/api/v1' 
    : 'http://localhost:8000/api/v1')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      auth.signOut()
    }
    return Promise.reject(error)
  }
)