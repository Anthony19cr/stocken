import { useState } from 'react'
import { Plus, Search, Truck, Mail, Phone, Pencil, Trash2 } from 'lucide-react'
import { useSuppliersPage, useDeactivateSupplier } from '../hooks/useSuppliers'
import { CreateSupplierModal } from '../components/CreateSupplierModal'
import { EditSupplierModal } from '../components/EditSupplierModal'
import { ConfirmModal } from '../../../components/ui/ConfirmModal'
import type { Supplier } from '../types/supplier.types'

export function SuppliersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deactivatingSupplier, setDeactivatingSupplier] = useState<Supplier | null>(null)

  const { data, isLoading } = useSuppliersPage(page, search || undefined)
  const { mutate: deactivate, isPending: deactivating } = useDeactivateSupplier()

  const handleDeactivate = () => {
    if (!deactivatingSupplier) return
    deactivate(deactivatingSupplier.id, {
      onSuccess: () => setDeactivatingSupplier(null),
    })
  }

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Proveedores</h2>
          <p className="text-sm font-medium mt-0.5 px-2 py-0.5 w-fit" 
            style={{ color: 'var(--brand-dark)', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '0.5rem' }}>
            {data?.total ?? 0} proveedores registrados
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 btn-primary text-sm font-medium rounded-lg"
        >
          <Plus size={16} />
          Nuevo proveedor
        </button>
      </div>

      <div className="relative max-w-sm rounded-[.5rem]" 
        style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar proveedor..."
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data?.data?.length ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay proveedores</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? 'Intenta con otro término' : 'Agrega tu primer proveedor'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Truck size={16} className="text-blue-600" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingSupplier(supplier)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeactivatingSupplier(supplier)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Desactivar"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-sm">{supplier.name}</h3>

              <div className="mt-2 space-y-1">
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.notes && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{supplier.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.total > 20 && (
        <div className="flex items-center justify-between">
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

      {showCreate && <CreateSupplierModal onClose={() => setShowCreate(false)} />}
      {editingSupplier && (
        <EditSupplierModal
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      )}
      {deactivatingSupplier && (
        <ConfirmModal
          title="Desactivar proveedor"
          message={`¿Estás seguro de que quieres desactivar "${deactivatingSupplier.name}"?`}
          confirmLabel="Desactivar"
          onConfirm={handleDeactivate}
          onClose={() => setDeactivatingSupplier(null)}
          isPending={deactivating}
          variant="danger"
        />
      )}
    </div>
  )
}