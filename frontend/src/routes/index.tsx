import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AgendaView } from '../pages/Agenda';
import { LoginView } from '../pages/Login';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { DEFAULT_SIGNED_IN_PATH, PATHS } from './paths';

export const router = createBrowserRouter([
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
        path: PATHS.agenda,
        element: <AgendaView />,
      },
      {
        path: '*',
        element: <Navigate to={DEFAULT_SIGNED_IN_PATH} replace />,
      },
    ],
  },
]);
