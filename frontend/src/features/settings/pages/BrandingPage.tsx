import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Palette, Save, Upload, Image } from 'lucide-react'
import { axiosInstance } from '../../../lib/axios'
import { useTenantBranding } from '../../../providers/TenantThemeProvider'

interface BrandingForm {
  restaurantName: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundImageUrl?: string
}

const colorPresets = [
  { name: 'Verde bosque', dark: '#1a5c3a', mid: '#2d8a5e', light: '#e8f5ee' },
  { name: 'Azul océano', dark: '#1a3a5c', mid: '#2d6a8a', light: '#e8f0f5' },
  { name: 'Vino tinto', dark: '#5c1a2d', mid: '#8a2d4a', light: '#f5e8ec' },
  { name: 'Tierra', dark: '#5c3a1a', mid: '#8a5c2d', light: '#f5ede8' },
  { name: 'Índigo', dark: '#2d1a5c', mid: '#4a2d8a', light: '#ede8f5' },
  { name: 'Coral', dark: '#5c2d1a', mid: '#8a4a2d', light: '#f5ece8' },
]

export function BrandingPage() {
  const queryClient = useQueryClient()
  const { data: branding, isLoading } = useTenantBranding()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const { mutate: update, isPending, isSuccess } = useMutation({
    mutationFn: async (dto: Partial<BrandingForm>) => {
      const { data } = await axiosInstance.patch('/branding', dto)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['branding'], data)
      queryClient.invalidateQueries({ queryKey: ['branding'] })
    },
  })

  const { register, handleSubmit, reset, watch, setValue } = useForm<BrandingForm>()

  useEffect(() => {
    if (branding) {
      reset({
        restaurantName: branding.restaurantName,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        backgroundImageUrl: (branding as any).backgroundImageUrl ?? '',
      })
      setPreviewUrl((branding as any).backgroundImageUrl ?? '')
    }
  }, [branding, reset])

  const watchedPrimary = watch('primaryColor')
  const watchedSecondary = watch('secondaryColor')
  const watchedAccent = watch('accentColor')

  // Convierte imagen a base64 y la guarda como URL
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setPreviewUrl(base64)
      setValue('backgroundImageUrl', base64)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = (values: BrandingForm) => {
    update({
      restaurantName: values.restaurantName,
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor,
      accentColor: values.accentColor,
      backgroundImageUrl: values.backgroundImageUrl || undefined,
    })
  }

  if (isLoading) {
    return <div className="max-w-2xl animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
    </div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Personaliza los colores y el fondo del sistema
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Nombre */}
        <div className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Identidad</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del restaurante
            </label>
            <input
              {...register('restaurantName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Imagen de fondo */}
        <div className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Image size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Imagen de fondo</h3>
          </div>

          <p className="text-xs text-gray-400">
            Sube una foto de tu local. Aparecerá de fondo en todo el sistema con un overlay del color de tu marca.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <input {...register('backgroundImageUrl')} type="hidden" />

          <div className="flex items-start gap-4">
            {/* Preview */}
            <div
              className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0"
              style={previewUrl ? { backgroundImage: `url('${previewUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!previewUrl && <Image size={20} className="text-gray-300" />}
            </div>

            <div className="flex-1 space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload size={14} />
                {uploading ? 'Procesando...' : 'Seleccionar imagen'}
              </button>
              <p className="text-xs text-gray-400">JPG, PNG o WEBP. Recomendado: 1920×1080px</p>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => { setPreviewUrl(''); setValue('backgroundImageUrl', '') }}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Colores de marca */}
        <div className="bg-white/80 backdrop-blur rounded-xl border border-white/60 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Palette size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Colores de marca</h3>
          </div>

          <p className="text-xs text-gray-400">
            Define los 3 tonos del color emblema de tu negocio. Se aplican en el sidebar, botones y elementos destacados.
          </p>

          {/* Presets */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Paletas predefinidas</p>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setValue('primaryColor', preset.dark)
                    setValue('secondaryColor', preset.mid)
                    setValue('accentColor', preset.light)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:border-gray-400 transition-colors bg-white"
                >
                  <div className="flex gap-0.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.dark }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.mid }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.light }} />
                  </div>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Colores manuales */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Oscuro (botones)
              </label>
              <div className="flex items-center gap-2">
                <input
                  {...register('primaryColor')}
                  type="color"
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  {...register('primaryColor')}
                  type="text"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                  placeholder="#1a5c3a"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Medio (sidebar)
              </label>
              <div className="flex items-center gap-2">
                <input
                  {...register('secondaryColor')}
                  type="color"
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  {...register('secondaryColor')}
                  type="text"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                  placeholder="#2d8a5e"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Claro (fondo)
              </label>
              <div className="flex items-center gap-2">
                <input
                  {...register('accentColor')}
                  type="color"
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <input
                  {...register('accentColor')}
                  type="text"
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                  placeholder="#e8f5ee"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
              Vista previa
            </div>
            <div className="p-4 flex items-center gap-3 flex-wrap">
              <div
                className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                style={{ backgroundColor: watchedPrimary }}
              >
                Botón primario
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                style={{ backgroundColor: watchedSecondary }}
              >
                Sidebar activo
              </div>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: watchedAccent, color: watchedPrimary }}
              >
                Badge / acento
              </div>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: watchedSecondary }}
              >
                <span className="text-white text-xs font-bold">S</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--brand-dark)' }}
          >
            <Save size={15} />
            {isPending ? 'Guardando...' : 'Aplicar tema'}
          </button>
          {isSuccess && (
            <span className="text-sm text-green-600 font-medium">✓ Tema aplicado</span>
          )}
        </div>
      </form>
    </div>
  )
}