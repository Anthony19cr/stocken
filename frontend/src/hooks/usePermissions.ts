import { useAuthStore } from '../store/auth.store'
import type { UserRole } from '../types/auth.types'

const roleHierarchy: Record<UserRole, number> = {
  TENANT_ADMIN: 4,
  MANAGER: 3,
  WAREHOUSE: 2,
  VIEWER: 1,
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role as UserRole | undefined

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!role) return false
    return roles.includes(role)
  }

  const hasMinRole = (minRole: UserRole): boolean => {
    if (!role) return false
    return roleHierarchy[role] >= roleHierarchy[minRole]
  }

  return {
    role,
    isAdmin: hasRole('TENANT_ADMIN'),
    isManager: hasMinRole('MANAGER'),
    isWarehouse: hasMinRole('WAREHOUSE'),
    isViewer: hasMinRole('VIEWER'),
    canManageUsers: hasRole('TENANT_ADMIN'),
    canManageSettings: hasRole('TENANT_ADMIN'),
    canManageProducts: hasMinRole('MANAGER'),
    canManageSuppliers: hasMinRole('MANAGER'),
    canRegisterMovements: hasMinRole('WAREHOUSE'),
    canViewReports: hasMinRole('MANAGER'),
    hasRole,
    hasMinRole,
  }
}