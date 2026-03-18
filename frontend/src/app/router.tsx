import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '../components/layout/AuthGuard'
import { GuestGuard } from '../components/layout/GuestGuard'
import { RoleGuard } from '../components/layout/RoleGuard'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { ProductsPage } from '../features/inventory/pages/ProductsPage'
import { EntriesPage } from '../features/entries/pages/EntriesPage'
import { OutputsPage } from '../features/outputs/pages/OutputsPage'
import { SuppliersPage } from '../features/suppliers/pages/SuppliersPage'
import { ReportsPage } from '../features/reports/pages/ReportsPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'
import { UsersPage } from '../features/users/pages/UsersPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },

      // Accesible para todos los roles autenticados
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'inventory', element: <ProductsPage /> },

      // Warehouse en adelante
      {
        path: 'entries',
        element: (
          <RoleGuard minRole="WAREHOUSE">
            <EntriesPage />
          </RoleGuard>
        ),
      },
      {
        path: 'outputs',
        element: (
          <RoleGuard minRole="WAREHOUSE">
            <OutputsPage />
          </RoleGuard>
        ),
      },

      // Manager en adelante
      {
        path: 'suppliers',
        element: (
          <RoleGuard minRole="MANAGER">
            <SuppliersPage />
          </RoleGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <RoleGuard minRole="MANAGER">
            <ReportsPage />
          </RoleGuard>
        ),
      },

      // Solo Admin
      {
        path: 'settings',
        element: (
          <RoleGuard minRole="TENANT_ADMIN">
            <SettingsPage />
          </RoleGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <RoleGuard minRole="TENANT_ADMIN">
            <UsersPage />
          </RoleGuard>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])