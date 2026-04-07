import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCreateSupplier } from '../hooks/useSuppliers'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

export function CreateSupplierModal({ onClose }: Props) {
  const { mutate: create, isPending, error } = useCreateSupplier()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  })

  const onSubmit = (values: FormValues) => {
    create(
      {
        name: values.name,
        phone: values.phone || undefined,
        email: values.email || undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: onClose },
    )
  }

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al crear el proveedor'
    : null

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div
        className="fixed z-50 bg-white rounded-2xl shadow-xl flex flex-col"
        style={{
          top: 'calc(var(--header-height) + 16px)',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '512px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Nuevo proveedor</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form id="create-supplier-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                  ${errors.name ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                placeholder="Ej: Distribuidora El Sol"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                  placeholder="+506 8888-8888"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                    ${errors.email ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                  placeholder="contacto@proveedor.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Observaciones opcionales..."
              />
            </div>
          </form>
        </div>

        {/* Botones fijos abajo */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-supplier-form"
            disabled={isPending}
            className="flex-1 py-2 px-4 btn-primary text-sm font-medium rounded-lg"
          >
            {isPending ? 'Creando...' : 'Crear proveedor'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}