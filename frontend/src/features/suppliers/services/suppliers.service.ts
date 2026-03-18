import { axiosInstance } from '../../../lib/axios'
import type { Supplier, CreateSupplierData } from '../types/supplier.types'
import type { PaginatedResponse } from '../../../types/api.types'

export const suppliersService = {
  getAll: async (page = 1, search?: string): Promise<PaginatedResponse<Supplier>> => {
    const params = new URLSearchParams({ page: String(page), pageSize: '20' })
    if (search) params.set('search', search)
    const { data } = await axiosInstance.get(`/suppliers?${params}`)
    return data
  },

  create: async (dto: CreateSupplierData): Promise<Supplier> => {
    const { data } = await axiosInstance.post('/suppliers', dto)
    return data
  },

  update: async (id: string, dto: Partial<CreateSupplierData>): Promise<Supplier> => {
    const { data } = await axiosInstance.patch(`/suppliers/${id}`, dto)
    return data
  },
}