import { Bell } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header
      className="fixed top-0 right-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-30"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
      }}
    >
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Bell size={16} />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 text-xs font-semibold">
              {user?.fullName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-700 font-medium hidden sm:block">
            {user?.fullName}
          </span>
        </div>
      </div>
    </header>
  )
}