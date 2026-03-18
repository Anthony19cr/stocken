import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services/users.service'
import type { CreateUserData } from '../types/user.types'

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number, search?: string) => [...userKeys.lists(), page, search] as const,
}

export function useUsers(page = 1, search?: string) {
  return useQuery({
    queryKey: userKeys.list(page, search),
    queryFn: () => usersService.getAll(page, search),
    staleTime: 1000 * 60,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateUserData) => usersService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useToggleUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}