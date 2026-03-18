import { axiosInstance } from '../../../lib/axios'
import type { DashboardSummary } from '../types/dashboard.types'

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const { data } = await axiosInstance.get('/dashboard/summary')
    return data
  },
}