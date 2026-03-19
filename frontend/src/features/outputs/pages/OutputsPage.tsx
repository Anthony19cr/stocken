import { useState } from 'react'
import { Plus, ArrowUpCircle } from 'lucide-react'
import { useOutputs } from '../hooks/useOutputs'
import { CreateOutputModal } from '../components/CreateOutputModal'
import { OUTPUT_REASON_LABELS } from '../types/output.types'

export function OutputsPage() {
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading } = useOutputs(page)

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-CR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Salidas de inventario</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} salidas registradas
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 btn-primary text-sm font-medium rounded-lg"
        >
          <Plus size={16} />
          Registrar salida
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center">
            <ArrowUpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay salidas registradas</p>
            <p className="text-gray-400 text-sm mt-1">Registra el primer consumo o descargo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((output) => (
                  <tr key={output.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {output.productName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      -{output.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {OUTPUT_REASON_LABELS[output.outputReason]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {output.notes ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDate(output.outputDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 20 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Mostrando {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} de {data.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= data.total}
                className="px-3 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateOutputModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}