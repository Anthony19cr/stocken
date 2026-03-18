import { axiosInstance } from '../../../lib/axios'
import type { User, CreateUserData } from '../types/user.types'
import type { PaginatedResponse } from '../../../types/api.types'

export const usersService = {
  getAll: async (page = 1, search?: string): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (search) params.set('search', search)
    const { data } = await axiosInstance.get(`/users?${params}`)
    return data
  },

  create: async (dto: CreateUserData): Promise<User> => {
    const { data } = await axiosInstance.post('/users', dto)
    return data
  },

  toggleActive: async (id: string, isActive: boolean): Promise<User> => {
    const { data } = await axiosInstance.patch(`/users/${id}`, { isActive })
    return data
  },
}