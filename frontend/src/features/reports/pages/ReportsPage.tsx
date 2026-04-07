import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, AlertTriangle, Clock, TrendingDown, Activity } from 'lucide-react'
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
        <p className="text-sm font-medium mt-0.5 px-2 py-0.5 w-fit"
          style={{ color: 'var(--brand-dark)', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '0.5rem' }}>
          Análisis operativo del inventario
        </p>
      </div>

      {/* Tabs — scroll horizontal en móvil */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-fit">
        <div className="flex gap-1 p-1 rounded-xl w-max min-w-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de fecha */}
      {(activeTab === 'consumption' || activeTab === 'movements') && (
        <div 
          className="flex flex-wrap items-center gap-3 p-2 rounded-xl w-fit"
          style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
        >
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white"
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
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
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
                            <td className="px-4 py-3 text-right font-semibold text-red-600">{item.currentStock} {item.unitSymbol}</td>
                            <td className="px-4 py-3 text-right text-gray-500">{item.minimumStock} {item.unitSymbol}</td>
                            <td className="px-4 py-3 text-right font-semibold text-orange-600">{item.deficit} {item.unitSymbol}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Móvil */}
                  <div className="md:hidden divide-y divide-gray-50">
                    {lowStock.map((item: any) => (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.categoryName}</p>
                          </div>
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            Déficit: {item.deficit} {item.unitSymbol}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                          <div>
                            <p className="text-gray-400">Stock actual</p>
                            <p className="font-semibold text-red-600">{item.currentStock} {item.unitSymbol}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Mínimo</p>
                            <p className="font-medium text-gray-600">{item.minimumStock} {item.unitSymbol}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}

            {/* Consumo */}
            {activeTab === 'consumption' && (
              consumption.length === 0 ? (
                <div className="p-12 text-center">
                  <TrendingDown className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin datos de consumo</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
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
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.totalQuantity} {item.unitSymbol}</td>
                            <td className="px-4 py-3 text-right text-gray-500">{item.outputCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden divide-y divide-gray-50">
                    {consumption.map((item: any, i: number) => (
                      <div key={i} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{item.totalQuantity} {item.unitSymbol}</p>
                          <p className="text-xs text-gray-400">{item.outputCount} salidas</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}

            {/* Por vencer */}
            {activeTab === 'expiring' && (
              expiring.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin productos por vencer</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
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
                            <td className="px-4 py-3 text-right text-gray-900">{item.quantity} {item.product?.unit?.symbol}</td>
                            <td className="px-4 py-3 font-semibold text-orange-600">{formatDate(item.expirationDate)}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(item.entryDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden divide-y divide-gray-50">
                    {expiring.map((item: any) => (
                      <div key={item.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">Entrada: {formatDate(item.entryDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-600">{formatDate(item.expirationDate)}</p>
                          <p className="text-xs text-gray-500">{item.quantity} {item.product?.unit?.symbol}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}

            {/* Movimientos */}
            {activeTab === 'movements' && (
              movements.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Sin movimientos</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto">
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
                            <td className={`px-4 py-3 text-right font-semibold ${m.direction === 'IN' ? 'text-green-600' : 'text-orange-600'}`}>
                              {m.direction === 'IN' ? '+' : '-'}{m.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-500">{m.stockAfter}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{m.performedBy?.fullName}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(m.occurredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden divide-y divide-gray-50">
                    {movements.map((m: any) => (
                      <div key={m.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{m.product?.name}</p>
                            <p className="text-xs text-gray-400">{m.performedBy?.fullName}</p>
                          </div>
                          <span className={`font-semibold text-sm ${m.direction === 'IN' ? 'text-green-600' : 'text-orange-600'}`}>
                            {m.direction === 'IN' ? '+' : '-'}{m.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${m.direction === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {m.type}
                          </span>
                          <p className="text-xs text-gray-400">{formatDate(m.occurredAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}