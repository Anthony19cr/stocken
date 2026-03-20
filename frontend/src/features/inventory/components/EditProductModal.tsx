import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useUpdateProduct } from '../hooks/useProducts'
import { useCategories, useUnits, useSuppliers } from '../hooks/useCatalogs'
import type { Product } from '../types/product.types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  unitId: z.string().min(1, 'Selecciona una unidad'),
  supplierId: z.string().optional(),
  minimumStock: z.coerce.number().min(0, 'No puede ser negativo'),
  maximumStock: z.coerce.number().min(0).optional(),
  tracksExpiration: z.boolean().optional().default(false),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  product: Product
  onClose: () => void
}

export function EditProductModal({ product, onClose }: Props) {
  const { mutate: update, isPending, error } = useUpdateProduct()
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const { data: suppliers = [] } = useSuppliers()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  })

  useEffect(() => {
    reset({
      name: product.name,
      sku: product.sku ?? '',
      categoryId: product.categoryId,
      unitId: product.unitId,
      supplierId: product.supplierId ?? '',
      minimumStock: product.minimumStock,
      maximumStock: product.maximumStock ?? undefined,
      tracksExpiration: product.tracksExpiration,
      notes: product.notes ?? '',
    })
  }, [product, reset])

  const onSubmit = (values: FormValues) => {
    const dto = {
            name: values.name,
            sku: values.sku || undefined,
            categoryId: values.categoryId,
            unitId: values.unitId,
            supplierId: values.supplierId || undefined,
            minimumStock: values.minimumStock,
            maximumStock: values.maximumStock || undefined,
            tracksExpiration: values.tracksExpiration ?? false,
            notes: values.notes || undefined,
        }
        update({ id: product.id, dto }, { onSuccess: onClose })
    }

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al actualizar el producto'
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto modal-fullscreen">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editar producto</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product.name}</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              {...register('sku')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                {...register('categoryId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad <span className="text-red-500">*</span>
              </label>
              <select
                {...register('unitId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select
              {...register('supplierId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">Sin proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock mínimo</label>
              <input
                {...register('minimumStock')}
                type="number" min="0" step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock máximo</label>
              <input
                {...register('maximumStock')}
                type="number" min="0" step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              {...register('tracksExpiration')}
              type="checkbox"
              id="tracksExpiration"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="tracksExpiration" className="text-sm text-gray-700">
              Registrar fecha de vencimiento en entradas
            </label>
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