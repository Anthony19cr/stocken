import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateUser } from '../hooks/useUsers'
import { USER_ROLE_LABELS, type UserRole } from '../types/user.types'

const schema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.string().min(1, 'Selecciona un rol'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

export function CreateUserModal({ onClose }: Props) {
  const { mutate: create, isPending, error } = useCreateUser()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { role: 'VIEWER' },
  })

  const onSubmit = (values: FormValues) => {
    create(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role as UserRole,
      },
      { onSuccess: onClose },
    )
  }

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al crear el usuario'
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-fullscreen">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Nuevo usuario</h2>
            <p className="text-xs text-gray-400 mt-0.5">Acceso al sistema de inventario</p>
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
              placeholder="Ej: Juan Pérez"
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                ${errors.email ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
              placeholder="usuario@restaurante.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              {...register('password')}
              type="password"
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                ${errors.password ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            >
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Descripción de roles */}
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[
                { role: 'TENANT_ADMIN', desc: 'Acceso total' },
                { role: 'MANAGER', desc: 'Inventario y reportes' },
                { role: 'WAREHOUSE', desc: 'Entradas y salidas' },
                { role: 'VIEWER', desc: 'Solo consulta' },
              ].map(({ role, desc }) => (
                <div key={role} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="font-medium text-gray-600">{USER_ROLE_LABELS[role as UserRole]}:</span>
                  {desc}
                </div>
              ))}
            </div>
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
              className="flex items-center gap-2 px-4 py-2 btn-primary text-sm font-medium rounded-lg"
            >
              {isPending ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}