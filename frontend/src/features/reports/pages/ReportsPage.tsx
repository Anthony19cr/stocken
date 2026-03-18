import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart3, AlertTriangle, Clock,
  TrendingDown, Activity,
} from 'lucide-react'
import { reportsService } from '../services/reports.service'

type ReportTab = 'low-stock' | 'consumption' | 'expiring' | 'movements'

const tabs: { id: ReportTab; label: string; icon: any }[] = [
  { id: 'low-stock', label: 'Bajo stock', icon: AlertTriangle },
  { id: 'consumption', label: 'Consumo', icon: TrendingDown },
  { id: 'expiring', label: 'Por vencer', icon: Clock },
  { id: 'movements', label: 'Movimientos', icon: Activity },
]

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('low-stock')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: lowStock = [], isLoading: loadingLowStock } = useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: reportsService.getLowStock,
    enabled: activeTab === 'low-stock',
  })

  const { data: consumption = [], isLoading: loadingConsumption } = useQuery({
    queryKey: ['reports', 'consumption', dateFrom, dateTo],
    queryFn: () => reportsService.getConsumption(dateFrom, dateTo),
    enabled: activeTab === 'consumption',
  })

  const { data: expiring = [], isLoading: loadingExpiring } = useQuery({
    queryKey: ['reports', 'expiring'],
    queryFn: reportsService.getExpiring,
    enabled: activeTab === 'expiring',
  })

  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['reports', 'movements', dateFrom, dateTo],
    queryFn: () => reportsService.getMovements(dateFrom, dateTo),
    enabled: activeTab === 'movements',
  })

  const isLoading = loadingLowStock || loadingConsumption || loadingExpiring || loadingMovements

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="space-y-5">

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Reportes</h2>
        <p className="text-sm text-gray-500 mt-0.5">Análisis operativo del inventario</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Filtros de fecha — solo para consumo y movimientos */}
      {(activeTab === 'consumption' || activeTab === 'movements') && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      )}

      {/* Contenido */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <>
            {/* Bajo stock */}
            {activeTab === 'low-stock' && (
              lowStock.length === 0 ? (
                <div className="p-12 text-center">
                  <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin productos con bajo stock</p>
                  <p className="text-gray-400 text-sm mt-1">Todos los productos están sobre el mínimo</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock actual</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mínimo</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Déficit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lowStock.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-gray-500">{item.categoryName ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {item.currentStock} {item.unitSymbol}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {item.minimumStock} {item.unitSymbol}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-orange-600">
                          {item.deficit} {item.unitSymbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Consumo */}
            {activeTab === 'consumption' && (
              consumption.length === 0 ? (
                <div className="p-12 text-center">
                  <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin datos de consumo</p>
                  <p className="text-gray-400 text-sm mt-1">Registra salidas para ver el consumo</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad total</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {consumption.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-gray-500">{item.categoryName ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {item.totalQuantity} {item.unitSymbol}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{item.outputCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Por vencer */}
            {activeTab === 'expiring' && (
              expiring.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin productos por vencer</p>
                  <p className="text-gray-400 text-sm mt-1">No hay productos próximos a vencer</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vence</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha entrada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiring.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.product?.name}</td>
                        <td className="px-4 py-3 text-right text-gray-900">
                          {item.quantity} {item.product?.unit?.symbol}
                        </td>
                        <td className="px-4 py-3 font-semibold text-orange-600">
                          {formatDate(item.expirationDate)}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {formatDate(item.entryDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* Movimientos */}
            {activeTab === 'movements' && (
              movements.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin movimientos</p>
                  <p className="text-gray-400 text-sm mt-1">No hay movimientos en el período seleccionado</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock después</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{m.product?.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                            ${m.direction === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {m.direction === 'IN' ? '+' : '-'} {m.type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold
                          ${m.direction === 'IN' ? 'text-green-600' : 'text-orange-600'}`}>
                          {m.direction === 'IN' ? '+' : '-'}{m.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{m.stockAfter}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{m.performedBy?.fullName}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(m.occurredAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}