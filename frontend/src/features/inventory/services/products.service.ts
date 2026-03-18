import { axiosInstance } from '../../../lib/axios'
import type { Product, ProductFilters, CreateProductData } from '../types/product.types'
import type { PaginatedResponse } from '../../../types/api.types'

export const productsService = {
  getAll: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams()
    if (filters.page) params.set('page', String(filters.page))
    if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
    if (filters.search) params.set('search', filters.search)
    if (filters.categoryId) params.set('categoryId', filters.categoryId)
    if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))
    if (filters.lowStock) params.set('lowStock', 'true')
    const { data } = await axiosInstance.get(`/products?${params}`)
    return data
  },

  getOne: async (id: string): Promise<Product> => {
    const { data } = await axiosInstance.get(`/products/${id}`)
    return data
  },

  create: async (dto: CreateProductData): Promise<Product> => {
    const { data } = await axiosInstance.post('/products', dto)
    return data
  },

  update: async (id: string, dto: Partial<CreateProductData>): Promise<Product> => {
    const { data } = await axiosInstance.patch(`/products/${id}`, dto)
    return data
  },

  deactivate: async (id: string): Promise<Product> => {
    const { data } = await axiosInstance.delete(`/products/${id}`)
    return data
  },
}