import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'

export const dashboardKeys = {
  summary: ['dashboard', 'summary'] as const,
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: dashboardService.getSummary,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // refresca cada minuto
  })
}