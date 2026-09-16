import type { ScheduleStatus } from '../../graphql/generated/graphql';

export type ReservationActionKind = 'confirm' | 'cancel';

export type ConfirmTone = 'primary' | 'danger';

export interface ReservationActionDescriptor {
  kind: ReservationActionKind;
  targetStatus: ScheduleStatus;
  pillLabel: string;
  accessibleVerb: string;
  title: string;
  verb: string;
  consequence: string;
  keepLabel: string;
  actLabel: string;
  tone: ConfirmTone;
}

const CONFIRM: ReservationActionDescriptor = {
  kind: 'confirm',
  targetStatus: 'confirmed',
  pillLabel: 'CONFIRMAR',
  accessibleVerb: 'Confirmar reserva de',
  title: 'Confirmar reserva',
  verb: 'Confirmar a reserva de',
  consequence: 'A reserva passa a confirmada na agenda.',
  keepLabel: 'VOLTAR',
  actLabel: 'CONFIRMAR',
  tone: 'primary',
};

const CANCEL: ReservationActionDescriptor = {
  kind: 'cancel',
  targetStatus: 'cancelled',
  pillLabel: 'CANCELAR',
  accessibleVerb: 'Cancelar reserva de',
  title: 'Cancelar reserva',
  verb: 'Cancelar a reserva de',
  consequence: 'A cliente perde a marcação e a reserva fica registada como cancelada.',
  keepLabel: 'MANTER',
  actLabel: 'SIM, CANCELAR',
  tone: 'danger',
};

export const RESERVATION_ACTIONS: Record<ReservationActionKind, ReservationActionDescriptor> = {
  confirm: CONFIRM,
  cancel: CANCEL,
};

export const RESERVATION_ACTIONS_BY_STATUS: Record<
  ScheduleStatus,
  readonly ReservationActionKind[]
> = {
  pending: ['confirm', 'cancel'],
  confirmed: ['cancel'],
  completed: [],
  cancelled: [],
};
