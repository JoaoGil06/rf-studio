import type { ScheduleStatus } from '../../graphql/generated/graphql';

export type ScheduleStatusSlug = 'pendentes' | 'confirmadas' | 'concluidas' | 'canceladas';

export interface ScheduleStatusDescriptor {
  value: ScheduleStatus;
  label: string;
  slug: ScheduleStatusSlug;
  tabLabel: string;
}

const PENDING: ScheduleStatusDescriptor = {
  value: 'pending',
  label: 'Pendente',
  slug: 'pendentes',
  tabLabel: 'PENDENTES',
};
const CONFIRMED: ScheduleStatusDescriptor = {
  value: 'confirmed',
  label: 'Confirmada',
  slug: 'confirmadas',
  tabLabel: 'CONFIRMADAS',
};
const COMPLETED: ScheduleStatusDescriptor = {
  value: 'completed',
  label: 'Concluída',
  slug: 'concluidas',
  tabLabel: 'CONCLUÍDAS',
};
const CANCELLED: ScheduleStatusDescriptor = {
  value: 'cancelled',
  label: 'Cancelada',
  slug: 'canceladas',
  tabLabel: 'CANCELADAS',
};

export const SCHEDULE_STATUSES: readonly ScheduleStatusDescriptor[] = [
  PENDING,
  CONFIRMED,
  COMPLETED,
  CANCELLED,
];

export const DEFAULT_SCHEDULE_STATUS: ScheduleStatusDescriptor = PENDING;

export const BOOKING_STATUS: ScheduleStatus = 'pending';

export const STATUS_PARAM = 'estado';

export interface ScheduleStatusTab {
  slug: ScheduleStatusSlug;
  label: string;
}

export const SCHEDULE_STATUS_TABS: readonly ScheduleStatusTab[] = SCHEDULE_STATUSES.map(
  (status) => ({ slug: status.slug, label: status.tabLabel }),
);
