import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ArrowDownCircle,
  ArrowUpCircle, Truck, BarChart3, Settings,
  Users, LogOut, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { usePermissions } from '../../hooks/usePermissions'
import { authService } from '../../features/auth/services/auth.service'
import { Palette } from 'lucide-react'

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const perms = usePermissions()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try { await authService.logout(refreshToken) } catch { }
    }
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { to: '/inventory', icon: Package, label: 'Inventario', show: true },
    { to: '/entries', icon: ArrowDownCircle, label: 'Entradas', show: perms.canRegisterMovements },
    { to: '/outputs', icon: ArrowUpCircle, label: 'Salidas', show: perms.canRegisterMovements },
    { to: '/suppliers', icon: Truck, label: 'Proveedores', show: perms.canManageSuppliers },
    { to: '/reports', icon: BarChart3, label: 'Reportes', show: perms.canViewReports },
  ]

  const bottomItems = [
    { to: '/branding', icon: Palette, label: 'Branding', show: perms.canManageSettings },
    { to: '/settings', icon: Settings, label: 'Configuración', show: perms.canManageSettings },
    { to: '/users', icon: Users, label: 'Usuarios', show: perms.canManageUsers },
  ]

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-40 border-r"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-14 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--brand-mid)' }}
        >
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <span className="font-semibold text-sm" style={{ color: 'var(--sidebar-text)' }}>
          Stocken
        </span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.filter(i => i.show).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => isActive ? {
              backgroundColor: 'var(--brand-dark)',
              color: '#ffffff',
            } : {}}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
              ${!isActive ? 'hover:bg-[var(--sidebar-hover)]' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  className="flex-shrink-0"
                  style={{ color: isActive ? '#ffffff' : 'var(--sidebar-text-muted)' }}
                />
                <span
                  className="flex-1 font-medium"
                  style={{ color: isActive ? '#ffffff' : 'var(--sidebar-text)' }}
                >
                  {label}
                </span>
                {isActive && <ChevronRight size={14} style={{ color: '#ffffff', opacity: 0.7 }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Nav inferior */}
      {bottomItems.some(i => i.show) && (
        <div
          className="px-3 pb-2 space-y-0.5 border-t pt-3"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          {bottomItems.filter(i => i.show).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => isActive ? {
                backgroundColor: 'var(--brand-dark)',
                color: '#ffffff',
              } : {}}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                ${!isActive ? 'hover:bg-[var(--sidebar-hover)]' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className="flex-shrink-0"
                    style={{ color: isActive ? '#ffffff' : 'var(--sidebar-text-muted)' }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: isActive ? '#ffffff' : 'var(--sidebar-text)' }}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}

      {/* Usuario */}
      <div
        className="px-3 pb-4 pt-2 border-t"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--brand-light)' }}
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--brand-dark)' }}>
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--sidebar-text)' }}>
              {user?.fullName}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: 'var(--sidebar-text-muted)' }}
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}