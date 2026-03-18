export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export type UserRole = 'TENANT_ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'VIEWER'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
}