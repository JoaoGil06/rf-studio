import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AgendaView } from '../pages/Agenda';
import { PATHS } from './paths';

export const router = createBrowserRouter([
  {
    path: PATHS.agenda,
    element: <AgendaView />,
  },
  {
    path: '*',
    element: <Navigate to={PATHS.agenda} replace />,
  },
]);
