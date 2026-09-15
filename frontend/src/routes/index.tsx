import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

import HomePage from '@/pages/HomePage'
import FleetPage from '@/pages/FleetPage'
import VehicleDetailsPage from '@/pages/VehicleDetailsPage'
import BookingPage from '@/pages/BookingPage'
import ConfirmationPage from '@/pages/ConfirmationPage'
import ReservationLookupPage from '@/pages/ReservationLookupPage'
import NotFoundPage from '@/pages/NotFoundPage'

import LoginPage from '@/pages/admin/LoginPage'
import DashboardPage from '@/pages/admin/DashboardPage'
import LocationsPage from '@/pages/admin/LocationsPage'
import VehiclesPage from '@/pages/admin/VehiclesPage'
import CustomersPage from '@/pages/admin/CustomersPage'
import ReservationsPage from '@/pages/admin/ReservationsPage'
import RentalsPage from '@/pages/admin/RentalsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'fleet', element: <FleetPage /> },
      { path: 'vehicles/:id', element: <VehicleDetailsPage /> },
      { path: 'booking/:vehicleId', element: <BookingPage /> },
      { path: 'confirmation/:code', element: <ConfirmationPage /> },
      { path: 'reservation/lookup', element: <ReservationLookupPage /> },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'locations', element: <LocationsPage /> },
          { path: 'vehicles', element: <VehiclesPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'reservations', element: <ReservationsPage /> },
          { path: 'rentals', element: <RentalsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
