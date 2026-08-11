import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AgendaView } from '../pages/Agenda';
import { DashboardView } from '../pages/Dashboard';
import { ClientsView } from '../pages/Clients';
import { LoginView } from '../pages/Login';
import { ProductsView } from '../pages/Products';
import { SchedulesView } from '../pages/Schedules';
import { ServicesView } from '../pages/Services';
import { AppLayout } from './AppLayout';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { DEFAULT_SIGNED_IN_PATH, PATHS } from './paths';

export const routes: RouteObject[] = [
  {
    element: <GuestRoute />,
    children: [
      {
        path: PATHS.login,
        element: <LoginView />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: PATHS.agenda,
            element: <AgendaView />,
          },
          {
            path: PATHS.dashboard,
            element: <DashboardView />,
          },
          {
            path: PATHS.schedules,
            element: <SchedulesView />,
          },
          {
            path: PATHS.products,
            element: <ProductsView />,
          },
          {
            path: PATHS.services,
            element: <ServicesView />,
          },
          {
            path: PATHS.clients,
            element: <ClientsView />,
          },
          {
            path: '*',
            element: <Navigate to={DEFAULT_SIGNED_IN_PATH} replace />,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
