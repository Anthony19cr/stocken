import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '../components/layout/AuthGuard'
import { GuestGuard } from '../components/layout/GuestGuard'
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'inventory', element: <ProductsPage /> },
      { path: 'entries', element: <EntriesPage /> },
      { path: 'outputs', element: <OutputsPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])