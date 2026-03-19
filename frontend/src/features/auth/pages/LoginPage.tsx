import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import { useLogin } from '../hooks/useLogin'

export function LoginPage() {
  const { mutate: login, isPending, error } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (values: LoginFormValues) => login(values)

  const errorMessage = error
    ? (error as any)?.response?.data?.error?.message ?? 'Error al iniciar sesión'
    : null

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ backgroundColor: 'var(--brand-mid)' }}
          >
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Stocken</h1>
          <p className="text-gray-500 mt-1">Sistema de Gestión de Inventario</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar sesión</h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@stocken.com"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors bg-white/80
                  ${errors.email
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-[var(--brand-mid)]'
                  }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors bg-white/80
                  ${errors.password
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-300 focus:border-[var(--brand-mid)]'
                  }`}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 text-white text-sm font-medium rounded-lg transition-colors mt-2"
              style={{
                backgroundColor: isPending ? 'var(--brand-light)' : 'var(--brand-dark)',
                color: isPending ? 'var(--brand-dark)' : '#ffffff',
              }}
            >
              {isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Stocken — Gestión de Inventario para Restaurantes
        </p>
      </div>
    </div>
  )
}