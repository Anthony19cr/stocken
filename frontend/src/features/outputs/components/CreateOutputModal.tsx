import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCreateOutput } from '../hooks/useOutputs'
import { useProducts } from '../../inventory/hooks/useProducts'
import { OUTPUT_REASON_LABELS, type OutputReason } from '../types/output.types'
 
const schema = z.object({
  productId: z.string().min(1, 'Selecciona un producto'),
  quantity: z.coerce.number().positive('Debe ser mayor a 0'),
  outputReason: z.string().min(1, 'Selecciona un motivo'),
  notes: z.string().optional(),
})
 
type FormValues = z.infer<typeof schema>
 
interface Props {
  onClose: () => void
}
 
export function CreateOutputModal({ onClose }: Props) {
  const { mutate: create, isPending, error } = useCreateOutput()
  const { data: productsData } = useProducts({ pageSize: 100, isActive: true })
 
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  })
 
  const selectedProductId = watch('productId')
  const selectedProduct = productsData?.data?.find((p) => p.id === selectedProductId)
 
  const onSubmit = (values: FormValues) => {
    create(
      {
        productId: values.productId,
        quantity: values.quantity,
        outputReason: values.outputReason as OutputReason,
        notes: values.notes || undefined,
      },
      { onSuccess: onClose },
    )
  }
 
  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al registrar la salida'
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
            <h2 className="text-base font-semibold text-gray-900">Registrar salida</h2>
            <p className="text-xs text-gray-400 mt-0.5">Consumo o descargo de inventario</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
 
        {/* Contenido scrollable */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form id="create-output-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
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
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                  ${errors.productId ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
              >
                <option value="">Seleccionar producto...</option>
                {productsData?.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Stock: {p.currentStock} {p.unitSymbol}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId.message}</p>}
            </div>
 
            {selectedProduct && (
              <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock disponible</span>
                <span className={`text-sm font-semibold ${
                  selectedProduct.currentStock <= 0 ? 'text-red-600' :
                  selectedProduct.stockStatus === 'LOW' ? 'text-yellow-600' :
                  'text-gray-900'
                }`}>
                  {selectedProduct.currentStock} {selectedProduct.unitSymbol}
                </span>
              </div>
            )}
 
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('outputReason')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors
                    ${errors.outputReason ? 'border-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                >
                  <option value="">Seleccionar...</option>
                  {Object.entries(OUTPUT_REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.outputReason && <p className="mt-1 text-xs text-red-500">{errors.outputReason.message}</p>}
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
            form="create-output-form"
            disabled={isPending}
            className="flex-1 py-2 px-4 btn-primary text-sm font-medium rounded-lg"
          >
            {isPending ? 'Registrando...' : 'Registrar salida'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  )
}