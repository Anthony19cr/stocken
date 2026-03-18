import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../../../lib/axios'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/categories')
      return data as { id: string; name: string }[]
    },
    staleTime: Infinity,
  })
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/units')
      return data as { id: string; name: string; symbol: string }[]
    },
    staleTime: Infinity,
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/suppliers')
      return data.data as { id: string; name: string }[]
    },
    staleTime: 1000 * 60 * 5,
  })
}