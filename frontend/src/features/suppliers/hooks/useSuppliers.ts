import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersService } from '../services/suppliers.service'
import type { CreateSupplierData } from '../types/supplier.types'

export const supplierKeys = {
  all: ['suppliers-full'] as const,
  lists: () => [...supplierKeys.all, 'list'] as const,
  list: (page: number, search?: string) => [...supplierKeys.lists(), page, search] as const,
}

export function useSuppliersPage(page = 1, search?: string) {
  return useQuery({
    queryKey: supplierKeys.list(page, search),
    queryFn: () => suppliersService.getAll(page, search),
    staleTime: 1000 * 60,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateSupplierData) => suppliersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
  })
}