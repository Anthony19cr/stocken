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
    <>
      <Sidebar />
      <Header title={title} />
      <main
        className="lg:pl-[240px]"
        style={{ paddingTop: 'var(--header-height)' }}
      >
        <div className="p-4 lg:p-6" style={{backdropFilter: 'blur(2px)'}}>
          <Outlet />
        </div>
      </main>
    </>
  )
}