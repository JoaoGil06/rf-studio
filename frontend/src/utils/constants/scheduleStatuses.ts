import type { ScheduleStatus } from '../../graphql/generated/graphql';

export interface ScheduleStatusDescriptor {
  value: ScheduleStatus;
  label: string;
}

const PENDING: ScheduleStatusDescriptor = { value: 'pending', label: 'Pendente' };
const CONFIRMED: ScheduleStatusDescriptor = { value: 'confirmed', label: 'Confirmada' };
const COMPLETED: ScheduleStatusDescriptor = { value: 'completed', label: 'Concluída' };
const CANCELLED: ScheduleStatusDescriptor = { value: 'cancelled', label: 'Cancelada' };

export const SCHEDULE_STATUSES: readonly ScheduleStatusDescriptor[] = [
  PENDING,
  CONFIRMED,
  COMPLETED,
  CANCELLED,
];

export const DEFAULT_SCHEDULE_STATUS: ScheduleStatusDescriptor = PENDING;
