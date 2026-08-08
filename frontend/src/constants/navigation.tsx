import type { ComponentType } from 'react';
import {
  BellIcon,
  CalendarIcon,
  ChartIcon,
  PersonIcon,
  PolishIcon,
  SparkleIcon,
} from '../components/icons';
import { PATHS } from '../routes/paths';

export interface NavSection {
  key: string;
  path: string;
  label: string;
  tabLabel: string;
  icon: ComponentType<{ className?: string }>;
}

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    key: 'agenda',
    path: PATHS.agenda,
    label: 'AGENDA',
    tabLabel: 'AGENDA',
    icon: CalendarIcon,
  },
  {
    key: 'dashboard',
    path: PATHS.dashboard,
    label: 'DASHBOARD',
    tabLabel: 'DASHBOARD',
    icon: ChartIcon,
  },
  {
    key: 'reservations',
    path: PATHS.reservations,
    label: 'RESERVAS',
    tabLabel: 'RESERVAS',
    icon: BellIcon,
  },
  {
    key: 'products',
    path: PATHS.products,
    label: 'PRODUTOS',
    tabLabel: 'PRODUTOS',
    icon: PolishIcon,
  },
  {
    key: 'services',
    path: PATHS.services,
    label: 'SERVIÇOS',
    tabLabel: 'SERVIÇOS',
    icon: SparkleIcon,
  },
  {
    key: 'clients',
    path: PATHS.clients,
    label: 'CLIENTES',
    tabLabel: 'CLIENTES',
    icon: PersonIcon,
  },
] as const;
