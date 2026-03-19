import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Settings } from 'lucide-react'
import { axiosInstance } from '../../../lib/axios'

interface SettingsForm {
  restaurantName: string
  systemName: string
  timezone: string
  currency: string
  dateFormat: string
  expirationAlertDays: number
  allowNegativeStock: boolean
}

export function SettingsPage() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/settings')
      return data as SettingsForm & { id: string; updatedAt: string }
    },
  })

  const { mutate: updateSettings, isPending, isSuccess } = useMutation({
        mutationFn: async (dto: Partial<SettingsForm>) => {
            const { data } = await axiosInstance.patch('/settings', dto)
            return data
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['settings'] })
            reset(data)
        },
    })

 const { register, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsForm>()

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  const onSubmit = (values: SettingsForm) => {
        updateSettings({
            restaurantName: values.restaurantName,
            systemName: values.systemName,
            timezone: values.timezone,
            currency: values.currency,
            dateFormat: values.dateFormat,
            expirationAlertDays: Number(values.expirationAlertDays),
            allowNegativeStock: values.allowNegativeStock,
        })
    }

  if (isLoading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Configuración del sistema</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Parámetros operativos del negocio
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Identidad */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Settings size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Identidad</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del restaurante
              </label>
              <input
                {...register('restaurantName', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del sistema
              </label>
              <input
                {...register('systemName', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Regional</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
              <select
                {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              >
                <option value="CRC">₡ Colón (CRC)</option>
                <option value="USD">$ Dólar (USD)</option>
                <option value="MXN">$ Peso MX (MXN)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formato de fecha</label>
              <select
                {...register('dateFormat')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona horaria</label>
            <select
              {...register('timezone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            >
              <option value="America/Costa_Rica">América/Costa Rica (UTC-6)</option>
              <option value="America/Mexico_City">América/Ciudad de México (UTC-6)</option>
              <option value="America/Bogota">América/Bogotá (UTC-5)</option>
              <option value="America/Lima">América/Lima (UTC-5)</option>
              <option value="America/Santiago">América/Santiago (UTC-3)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        {/* Inventario */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Inventario</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Días de alerta por vencimiento
            </label>
            <input
              {...register('expirationAlertDays', { valueAsNumber: true, min: 1 })}
              type="number"
              min="1"
              max="365"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">
              Días de anticipación para mostrar alertas de vencimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              {...register('allowNegativeStock')}
              type="checkbox"
              id="allowNegativeStock"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="allowNegativeStock" className="text-sm font-medium text-gray-700">
                Permitir stock negativo
              </label>
              <p className="text-xs text-gray-400">
                Permite registrar salidas aunque el stock sea insuficiente
              </p>
            </div>
          </div>
        </div>

        {/* Botón */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || !isDirty}
            className="flex items-center gap-2 px-4 py-2 btn-primary text-sm font-medium rounded-lg"
          >
            <Save size={15} />
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
          {isSuccess && !isDirty && (
            <span className="text-sm text-green-600 font-medium">✓ Cambios guardados</span>
          )}
        </div>
      </form>
    </div>
  )
}