import { Bell } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import { axiosInstance } from '../../lib/axios'
import { Menu } from 'lucide-react'

interface Alert {
  id: string
  productName?: string
  alertType: 'STOCK_LOW' | 'STOCK_OUT' | 'EXPIRATION_SOON' | 'STOCK_OVERFLOW' | 'HIGH_WASTE'
  detectedAt: string
}

const ALERT_LABELS: Record<string, string> = {
  STOCK_LOW: 'Stock bajo',
  STOCK_OUT: 'Sin stock',
  EXPIRATION_SOON: 'Por vencer',
  STOCK_OVERFLOW: 'Exceso de stock',
  HIGH_WASTE: 'Alta merma',
}

const ALERT_COLORS: Record<string, string> = {
  STOCK_LOW: 'text-yellow-600',
  STOCK_OUT: 'text-red-600',
  EXPIRATION_SOON: 'text-orange-600',
  STOCK_OVERFLOW: 'text-blue-600',
  HIGH_WASTE: 'text-purple-600',
}

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore((s) => s.user)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [showAlerts, setShowAlerts] = useState(false)
  const alertsRef = useRef<HTMLDivElement>(null)

  const { data: alertsData } = useQuery({
    queryKey: ['alerts-header'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/alerts?pageSize=10')
      return data as { data: Alert[]; total: number }
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })

  const activeCount = alertsData?.total ?? 0
  const alerts = alertsData?.data ?? []

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setShowAlerts(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 flex items-center justify-between px-4 lg:px-6 z-30"
      style={{
        left: 0,
        height: 'var(--header-height)',
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburguesa móvil */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Espaciado desktop */}
        <div className="hidden lg:block" style={{ width: 'var(--sidebar-width)' }} />

        <h1 className="text-base font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Campanita */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <Bell size={16} />
            {activeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: 'var(--brand-dark)', fontSize: '10px' }}>
                {activeCount > 9 ? '9+' : activeCount}
              </span>
            )}
          </button>

          {/* Dropdown de alertas */}
          {showAlerts && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Alertas activas</p>
                {activeCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand-dark)' }}>
                    {activeCount}
                  </span>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">Sin alertas activas</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{alert.productName}</p>
                          <p className={`text-xs font-medium mt-0.5 ${ALERT_COLORS[alert.alertType]}`}>
                            {ALERT_LABELS[alert.alertType]}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(alert.detectedAt).toLocaleDateString('es-CR', {
                            day: '2-digit', month: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeCount > 10 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400">
                    +{activeCount - 10} alertas más
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
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