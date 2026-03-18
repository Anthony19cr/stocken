import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { outputsService } from '../services/outputs.service'
import { productKeys } from '../../inventory/hooks/useProducts'
import type { CreateOutputData } from '../types/output.types'

export const outputKeys = {
  all: ['outputs'] as const,
  lists: () => [...outputKeys.all, 'list'] as const,
  list: (page: number) => [...outputKeys.lists(), page] as const,
}

export function useOutputs(page = 1) {
  return useQuery({
    queryKey: outputKeys.list(page),
    queryFn: () => outputsService.getAll(page),
    staleTime: 1000 * 60,
  })
}

export function useCreateOutput() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateOutputData) => outputsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outputKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}