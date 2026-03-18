import { useState } from 'react'
import { Plus, Search, AlertTriangle, Package } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCatalogs'
import { StockStatusBadge } from '../components/StockStatusBadge'
import { CreateProductModal } from '../components/CreateProductModal'

export function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [lowStock, setLowStock] = useState(false)
  const [page, setPage] = useState(1)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useProducts({
    search: search || undefined,
    categoryId: categoryId || undefined,
    lowStock: lowStock || undefined,
    page,
    pageSize: 20,
  })

  const { data: categories = [] } = useCategories()

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} productos registrados
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button
          onClick={() => { setLowStock(!lowStock); setPage(1) }}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors
            ${lowStock
              ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
        >
          <AlertTriangle size={14} />
          Stock bajo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay productos</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || categoryId || lowStock
                ? 'Intenta con otros filtros'
                : 'Crea tu primer producto'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock actual</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mínimo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        {product.sku && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{product.sku}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.categoryName ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        product.stockStatus === 'OUT' ? 'text-red-600' :
                        product.stockStatus === 'LOW' ? 'text-yellow-600' :
                        'text-gray-900'
                      }`}>
                        {product.currentStock}
                      </span>
                      <span className="text-gray-400 ml-1">{product.unitSymbol}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {product.minimumStock} {product.unitSymbol}
                    </td>
                    <td className="px-4 py-3">
                      <StockStatusBadge status={product.stockStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
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

      {showCreate && <CreateProductModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}