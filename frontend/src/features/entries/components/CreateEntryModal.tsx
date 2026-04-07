import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCreateEntry } from '../hooks/useEntries'
import { useProducts } from '../../inventory/hooks/useProducts'
import { useSuppliers } from '../../inventory/hooks/useCatalogs'
 
const schema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  supplierId: z.string().optional(),
  quantity: z.coerce.number().positive('Debe ser mayor a 0'),
  unitCost: z.coerce.number().min(0).optional(),
  expirationDate: z.string().optional(),
  notes: z.string().optional(),
})
 
type FormValues = z.infer<typeof schema>
 
interface Props {
  onClose: () => void
  productId?: string
}
 
export function CreateEntryModal({ onClose, productId }: Props) {
  const { mutate: create, isPending, error } = useCreateEntry()
  const { data: productsData } = useProducts({ pageSize: 100, isActive: true })
  const { data: suppliers = [] } = useSuppliers()
 
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { productId: productId ?? '' },
  })
 
  const selectedProductId = watch('productId')
  const selectedProduct = productsData?.data?.find((p) => p.id === selectedProductId)
 
  const onSubmit = (values: FormValues) => {
    const dto = {
      productId: values.productId,
      supplierId: values.supplierId || undefined,
      quantity: values.quantity,
      unitCost: values.unitCost || undefined,
      expirationDate: values.expirationDate || undefined,
      notes: values.notes || undefined,
    }
    create(dto, { onSuccess: onClose })
  }
 
  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al registrar la entrada'
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
          <div>
            <h2 className="text-base font-semibold text-gray-900">Registrar entrada</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ingreso de mercadería al inventario</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
 
        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form id="create-entry-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto <span className="text-red-500">*</span>
              </label>
              <select
                {...register('productId')}
                disabled={!!productId}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                  ${errors.productId ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}
                  ${productId ? 'bg-gray-50' : ''}`}
              >
                <option value="">Seleccionar producto...</option>
                {productsData?.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `(${p.sku})` : ''} — Stock: {p.currentStock} {p.unitSymbol}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId.message}</p>}
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
                  Cantidad <span className="text-red-500">*</span>
                  {selectedProduct && (
                    <span className="text-gray-400 font-normal ml-1">({selectedProduct.unitSymbol})</span>
                  )}
                </label>
                <input
                  {...register('quantity')}
                  type="number" min="0.001" step="0.001"
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                    ${errors.quantity ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                  placeholder="0"
                />
                {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo unitario</label>
                <input
                  {...register('unitCost')}
                  type="number" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
 
            {selectedProduct?.tracksExpiration && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de vencimiento
                </label>
                <input
                  {...register('expirationDate')}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}
 
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
            form="create-entry-form"
            disabled={isPending}
            className="flex-1 py-2 px-4 btn-primary text-sm font-medium rounded-lg"
          >
            {isPending ? 'Registrando...' : 'Registrar entrada'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}