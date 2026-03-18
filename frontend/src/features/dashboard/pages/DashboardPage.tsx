import {
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Bell,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { useDashboardSummary } from '../hooks/useDashboard'

export function DashboardPage() {
  const { data, isLoading, isError } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Resumen operativo</h2>
          <p className="text-sm text-gray-500 mt-1">Cargando datos...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Error al cargar el dashboard</p>
          <p className="text-gray-400 text-sm mt-1">Verifica la conexión con el servidor</p>
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">{today}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Resumen operativo del inventario
        </p>
      </div>

      {/* Alertas activas — destacado si hay */}
      {data.activeAlertsCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Bell size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Tienes <span className="font-semibold">{data.activeAlertsCount} alertas activas</span> que requieren atención.
          </p>
        </div>
      )}

      {/* KPIs principales */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Inventario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total productos"
            value={data.totalProducts}
            icon={Package}
            color="blue"
            description={`${data.activeProducts} activos`}
          />
          <StatCard
            title="Stock bajo"
            value={data.lowStockCount}
            icon={AlertTriangle}
            color="yellow"
            alert
            description="Por debajo del mínimo"
          />
          <StatCard
            title="Sin stock"
            value={data.outOfStockCount}
            icon={XCircle}
            color="red"
            alert
            description="Stock agotado"
          />
          <StatCard
            title="Por vencer"
            value={data.expiringCount}
            icon={Clock}
            color="orange"
            alert
            description="Próximos a vencer"
          />
        </div>
      </div>

      {/* Actividad del día */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Actividad
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Entradas hoy"
            value={data.todayEntries}
            icon={ArrowDownCircle}
            color="green"
            description="Ingresos registrados"
          />
          <StatCard
            title="Salidas hoy"
            value={data.todayOutputs}
            icon={ArrowUpCircle}
            color="purple"
            description="Consumos registrados"
          />
          <StatCard
            title="Movimientos esta semana"
            value={data.weekMovements}
            icon={Activity}
            color="blue"
            description="Últimos 7 días"
          />
        </div>
      </div>

      {/* Estado general */}
      {data.activeAlertsCount === 0 && data.outOfStockCount === 0 && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-800">
            Todo en orden — no hay alertas activas ni productos agotados.
          </p>
        </div>
      )}

    </div>
  )
}