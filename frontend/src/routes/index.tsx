import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

import HomePage from '@/pages/HomePage'
import FleetPage from '@/pages/FleetPage'
import VehicleDetailsPage from '@/pages/VehicleDetailsPage'
import NotFoundPage from '@/pages/NotFoundPage'

import LoginPage from '@/pages/admin/LoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'

export const router = createBrowserRouter([
  // Public
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'fleet', element: <FleetPage /> },
      { path: 'vehicles/:id', element: <VehicleDetailsPage /> },
    ],
  },

  // Admin login (public)
  {
    path: '/admin/login',
    element: <LoginPage />,
  },

  // Admin protected
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])
