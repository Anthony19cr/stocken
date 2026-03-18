import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { entriesService } from '../services/entries.service'
import { productKeys } from '../../inventory/hooks/useProducts'
import type { CreateEntryData } from '../types/entry.types'

export const entryKeys = {
  all: ['entries'] as const,
  lists: () => [...entryKeys.all, 'list'] as const,
  list: (page: number, productId?: string) => [...entryKeys.lists(), page, productId] as const,
}

export function useEntries(page = 1, productId?: string) {
  return useQuery({
    queryKey: entryKeys.list(page, productId),
    queryFn: () => entriesService.getAll(page, 20, productId),
    staleTime: 1000 * 60,
  })
}

export function useCreateEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateEntryData) => entriesService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}