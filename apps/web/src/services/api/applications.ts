import { apiClient } from './client'
import type { Application, ApiResponse, PaginatedResponse } from '../../types'

export const applicationsApi = {
  getAll: async (page = 1, limit = 10, status?: string) => {
    const response = await apiClient.get<PaginatedResponse<Application>>('/applications', {
      params: { page, limit, status }
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Application>>(`/applications/${id}`)
    return response.data
  },

  getByUser: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<Application[]>>(`/applications/user/${userId}`)
    return response.data
  },

  create: async (data: Omit<Application, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<Application>>('/applications', data)
    return response.data
  },

  updateStatus: async (id: string, status: Application['status'], reviewNotes?: string) => {
    const response = await apiClient.patch<ApiResponse<Application>>(`/applications/${id}/status`, {
      status,
      reviewNotes
    })
    return response.data
  }
}