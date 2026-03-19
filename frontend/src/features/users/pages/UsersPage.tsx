import { useState } from 'react'
import { Plus, Search, Users, Shield } from 'lucide-react'
import { useUsers, useToggleUserActive } from '../hooks/useUsers'
import { CreateUserModal } from '../components/CreateUserModal'
import { USER_ROLE_LABELS, USER_ROLE_COLORS } from '../types/user.types'
import { useAuthStore } from '../../../store/auth.store'

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const currentUser = useAuthStore((s) => s.user)

  const { data, isLoading } = useUsers(page, search || undefined)
  const { mutate: toggleActive, isPending: toggling } = useToggleUserActive()

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-CR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} usuarios registrados
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 btn-primary text-sm font-medium rounded-lg"
        >
          <Plus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar usuario..."
          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay usuarios</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Intenta con otro término' : 'Crea el primer usuario'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-xs font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-blue-500 font-medium">(tú)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${USER_ROLE_COLORS[user.role]}`}>
                        <Shield size={10} />
                        {USER_ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => toggleActive({ id: user.id, isActive: !user.isActive })}
                          disabled={toggling}
                          className={`text-xs font-medium transition-colors
                            ${user.isActive
                              ? 'text-red-500 hover:text-red-700'
                              : 'text-green-600 hover:text-green-800'
                            }`}
                        >
                          {user.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
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

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}