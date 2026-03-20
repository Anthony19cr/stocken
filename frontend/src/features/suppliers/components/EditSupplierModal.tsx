import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useUpdateSupplier } from '../hooks/useSuppliers'
import type { Supplier } from '../types/supplier.types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  supplier: Supplier
  onClose: () => void
}

export function EditSupplierModal({ supplier, onClose }: Props) {
  const { mutate: update, isPending, error } = useUpdateSupplier()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  })

  useEffect(() => {
    reset({
      name: supplier.name,
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      notes: supplier.notes ?? '',
    })
  }, [supplier, reset])

  const onSubmit = (values: FormValues) => {
    update(
      {
        id: supplier.id,
        dto: {
          name: values.name,
          phone: values.phone || undefined,
          email: values.email || undefined,
          notes: values.notes || undefined,
        },
      },
      { onSuccess: onClose },
    )
  }

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al actualizar el proveedor'
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-fullscreen">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editar proveedor</h2>
            <p className="text-xs text-gray-400 mt-0.5">{supplier.name}</p>
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
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                ${errors.name ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                  ${errors.email ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
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
            />
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
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}