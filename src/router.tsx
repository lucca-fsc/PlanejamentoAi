import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import { SimulationFormPage } from './pages/SimulationFormPage'
import { SimulationResultsPage } from './pages/SimulationResultsPage'
import { LoginPage } from '@/pages/LoginPage'
import { SimulationHistPage } from '@/pages/SimulationHistPage'
import { SimulationInsightPage } from '@/pages/SimulationInsightPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/',
        element: <SimulationFormPage />,
      },
      {
        path: '/resultado/:id',
        element: <SimulationResultsPage />,
      },
      {
        path: '/historico',
        element: <SimulationHistPage />,
      },
      {
        path: '/insight/:id',
        element: <SimulationInsightPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
