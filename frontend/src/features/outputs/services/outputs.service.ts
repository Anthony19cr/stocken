import { axiosInstance } from '../../../lib/axios'
import type { Output, CreateOutputData } from '../types/output.types'
import type { PaginatedResponse } from '../../../types/api.types'

export const outputsService = {
  getAll: async (page = 1, pageSize = 20): Promise<PaginatedResponse<Output>> => {
    const { data } = await axiosInstance.get(`/outputs?page=${page}&pageSize=${pageSize}`)
    return data
  },

  create: async (dto: CreateOutputData): Promise<Output> => {
    const { data } = await axiosInstance.post('/outputs', dto)
    return data
  },
}