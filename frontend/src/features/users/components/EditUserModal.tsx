import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../lib/axios'
import { USER_ROLE_LABELS, type User } from '../types/user.types'
import { userKeys } from '../hooks/useUsers'

const schema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  role: z.string().min(1),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  user: User
  onClose: () => void
}

export function EditUserModal({ user, onClose }: Props) {
  const queryClient = useQueryClient()

  const { mutate: update, isPending, error } = useMutation({
    mutationFn: async (dto: Partial<FormValues>) => {
      const { data } = await axiosInstance.patch(`/users/${user.id}`, dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      onClose()
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  })

  useEffect(() => {
    reset({
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      password: '',
    })
  }, [user, reset])

  const onSubmit = (values: FormValues) => {
    const dto: Record<string, unknown> = {
      fullName: values.fullName,
      role: values.role,
      isActive: values.isActive,
    }
    if (values.password) dto.password = values.password
    update(dto)
  }

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al actualizar el usuario'
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-fullscreen">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editar usuario</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="px-6 py-4 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('fullName')}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                ${errors.fullName ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            >
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
              <span className="text-gray-400 font-normal ml-1">(dejar vacío para no cambiar)</span>
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="flex items-center gap-3">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Usuario activo
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2 px-4 text-white text-sm font-medium rounded-lg transition-colors btn-primary"
            >
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}