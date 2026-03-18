import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Truck,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { authService } from '../../features/auth/services/auth.service'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
  { to: '/entries', icon: ArrowDownCircle, label: 'Entradas' },
  { to: '/outputs', icon: ArrowUpCircle, label: 'Salidas' },
  { to: '/suppliers', icon: Truck, label: 'Proveedores' },
  { to: '/reports', icon: BarChart3, label: 'Reportes' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Configuración' },
  { to: '/users', icon: Users, label: 'Usuarios' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try { await authService.logout(refreshToken) } catch { /* silencioso */ }
    }
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen bg-slate-900 flex flex-col z-40"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <span className="text-white font-semibold text-sm tracking-wide">Stocken</span>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className="flex-shrink-0" />
                <span className="flex-1 font-medium">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Nav inferior */}
      <div className="px-3 pb-2 space-y-0.5 border-t border-slate-800 pt-3">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
              ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Usuario */}
      <div className="px-3 pb-4 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-slate-300 text-xs font-semibold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-slate-500 text-xs truncate">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded"
            title="Cerrar sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}