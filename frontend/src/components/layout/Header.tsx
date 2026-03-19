import { Bell } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header
      className="fixed top-0 right-0 flex items-center justify-between px-6 z-30"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <h1 className="text-base font-semibold text-gray-800">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--brand-light)' }}
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--brand-dark)' }}>
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