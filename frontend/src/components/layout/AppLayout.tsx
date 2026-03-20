import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventario',
  '/entries': 'Entradas de Inventario',
  '/outputs': 'Salidas de Inventario',
  '/suppliers': 'Proveedores',
  '/reports': 'Reportes',
  '/settings': 'Configuración',
  '/branding': 'Branding',
  '/users': 'Usuarios',
}

export function AppLayout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Stocken'

  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header title={title} />
      <main
        className="pt-14 min-h-screen lg:pl-[240px]"
      >
        <div
          className="min-h-screen p-4 lg:p-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}