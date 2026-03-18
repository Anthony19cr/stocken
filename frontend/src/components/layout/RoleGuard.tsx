import { Navigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import type { UserRole } from '../../types/auth.types'

interface Props {
  minRole: UserRole
  children: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ minRole, children, redirectTo = '/dashboard' }: Props) {
  const { hasMinRole } = usePermissions()
  if (!hasMinRole(minRole)) return <Navigate to={redirectTo} replace />
  return <>{children}</>
}