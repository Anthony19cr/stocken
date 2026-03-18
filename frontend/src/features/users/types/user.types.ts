export type UserRole = 'TENANT_ADMIN' | 'MANAGER' | 'WAREHOUSE' | 'VIEWER'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  TENANT_ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  WAREHOUSE: 'Almacén',
  VIEWER: 'Consulta',
}

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  TENANT_ADMIN: 'bg-purple-100 text-purple-700',
  MANAGER: 'bg-blue-100 text-blue-700',
  WAREHOUSE: 'bg-green-100 text-green-700',
  VIEWER: 'bg-gray-100 text-gray-600',
}

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  fullName: string
  email: string
  password: string
  role?: UserRole
}