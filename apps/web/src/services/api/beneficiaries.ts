import { apiClient } from './client'
import type { Beneficiary, ApiResponse, PaginatedResponse } from '../../types'

export const beneficiariesApi = {
  getAll: async (page = 1, limit = 10, barangay?: string) => {
    const response = await apiClient.get<PaginatedResponse<Beneficiary>>('/beneficiaries', {
      params: { page, limit, barangay }
    })
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`)
    return response.data
  },

  getByUser: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<Beneficiary>>(`/beneficiaries/user/${userId}`)
    return response.data
  },

  create: async (data: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiClient.post<ApiResponse<Beneficiary>>('/beneficiaries', data)
    return response.data
  },

  update: async (id: string, data: Partial<Beneficiary>) => {
    const response = await apiClient.put<ApiResponse<Beneficiary>>(`/beneficiaries/${id}`, data)
    return response.data
  }
}