
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCreateProduct } from '../hooks/useProducts'
import { useCategories, useUnits, useSuppliers } from '../hooks/useCatalogs'
 
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
  onClose: () => void
}
 
export function CreateProductModal({ onClose }: Props) {
  const { mutate: create, isPending, error } = useCreateProduct()
  const { data: categories = [] } = useCategories()
  const { data: units = [] } = useUnits()
  const { data: suppliers = [] } = useSuppliers()
 
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { tracksExpiration: false, minimumStock: 0 },
  })
 
  const onSubmit = (values: FormValues) => {
    create(
      {
        name: values.name,
        sku: values.sku || undefined,
        categoryId: values.categoryId,
        unitId: values.unitId,
        supplierId: values.supplierId || undefined,
        minimumStock: values.minimumStock,
        maximumStock: values.maximumStock || undefined,
        tracksExpiration: values.tracksExpiration ?? false,
        notes: values.notes || undefined,
      },
      { onSuccess: onClose },
    )
  }
 
  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al crear el producto'
    : null
 
  // Portal: renderiza directamente en document.body, fuera del árbol del <main>.
  // Esto escapa el stacking context y el backdrop-filter: blur del contenedor padre.
  return createPortal(
    <>
      {/* Overlay: cubre toda la pantalla excepto sidebar (desktop) y header */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
 
      {/* Modal: posicionado en el área de contenido */}
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
          <h2 className="text-base font-semibold text-gray-900">Nuevo producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
 
        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form
            id="create-product-form"
            onSubmit={handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
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
                placeholder="Ej: Tomate cherry"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                {...register('sku')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                placeholder="Ej: TOM-001"
              />
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('categoryId')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                    ${errors.categoryId ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('unitId')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                    ${errors.unitId ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                >
                  <option value="">Seleccionar...</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                  ))}
                </select>
                {errors.unitId && <p className="mt-1 text-xs text-red-500">{errors.unitId.message}</p>}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock mínimo <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('minimumStock')}
                  type="number" min="0" step="0.001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                />
                {errors.minimumStock && <p className="mt-1 text-xs text-red-500">{errors.minimumStock.message}</p>}
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
            form="create-product-form"
            disabled={isPending}
            className="flex-1 py-2 px-4 btn-primary text-sm font-medium rounded-lg"
          >
            {isPending ? 'Creando...' : 'Crear producto'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}