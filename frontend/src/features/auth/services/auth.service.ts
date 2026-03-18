import { axiosInstance } from '../../../lib/axios'
import type { AuthResponse, LoginCredentials } from '../../../types/auth.types'

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post('/auth/login', credentials)
    return data
  },

  logout: async (refreshToken: string): Promise<void> => {
    await axiosInstance.post('/auth/logout', { refreshToken })
  },
}