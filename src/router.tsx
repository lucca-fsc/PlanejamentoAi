import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { SimulationFormPage } from './pages/SimulationFormPage'
import { SimulationResultsPage } from './pages/SimulationResultsPage'
import { SimulationHistPage } from '@/pages/SimulationHistPage'
import { SimulationInsightPage } from '@/pages/SimulationInsightPage'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
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
        element: <SimulationInsightPage />
      },
    ],
  },
])