import { axiosInstance } from '../../../lib/axios'
import type { Entry, CreateEntryData } from '../types/entry.types'
import type { PaginatedResponse } from '../../../types/api.types'

export const entriesService = {
  getAll: async (page = 1, pageSize = 20, productId?: string): Promise<PaginatedResponse<Entry>> => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    if (productId) params.set('productId', productId)
    const { data } = await axiosInstance.get(`/entries?${params}`)
    return data
  },

  create: async (dto: CreateEntryData): Promise<Entry> => {
    const { data } = await axiosInstance.post('/entries', dto)
    return data
  },
}