import { apiClient } from './client'
import type { Program, ApiResponse, PaginatedResponse } from '../../types'

export const programsApi = {
  getAll: async (page = 1, limit = 10) => {
    const response = await apiClient.get<PaginatedResponse<Program>>('/programs', {
      params: { page, limit }
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Program>>(`/programs/${id}`)
    return response.data
  },

  create: async (data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<Program>>('/programs', data)
    return response.data
  },

  update: async (id: string, data: Partial<Program>) => {
    const response = await apiClient.put<ApiResponse<Program>>(`/programs/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(`/programs/${id}`)
    return response.data
  }
}