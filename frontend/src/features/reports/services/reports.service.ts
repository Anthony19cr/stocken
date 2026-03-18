import { axiosInstance } from '../../../lib/axios'

export const reportsService = {
  getLowStock: async () => {
    const { data } = await axiosInstance.get('/reports/low-stock')
    return data as any[]
  },

  getConsumption: async (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const { data } = await axiosInstance.get(`/reports/consumption?${params}`)
    return data as any[]
  },

  getExpiring: async () => {
    const { data } = await axiosInstance.get('/reports/expiring')
    return data as any[]
  },

  getMovements: async (dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const { data } = await axiosInstance.get(`/reports/movements?${params}`)
    return data as any[]
  },
}