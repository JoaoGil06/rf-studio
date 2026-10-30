import type { ScheduleStatus } from '../../graphql/generated/graphql';

export type ReservationActionKind = 'confirm' | 'cancel' | 'complete';

/** The actions answered by a yes/no dialog. `complete` has a form instead. */
export type ReservationStatusActionKind = Exclude<ReservationActionKind, 'complete'>;

export type ConfirmTone = 'primary' | 'danger';

export interface ReservationActionPill {
  kind: ReservationActionKind;
  targetStatus: ScheduleStatus;
  pillLabel: string;
  accessibleVerb: string;
  tone: ConfirmTone;
}

export interface ReservationActionDescriptor extends ReservationActionPill {
  kind: ReservationStatusActionKind;
  title: string;
  verb: string;
  consequence: string;
  keepLabel: string;
  actLabel: string;
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

const COMPLETE: ReservationActionPill = {
  kind: 'complete',
  targetStatus: 'completed',
  pillLabel: 'CONCLUIR',
  accessibleVerb: 'Concluir reserva de',
  tone: 'primary',
};

export const RESERVATION_ACTIONS: Record<ReservationStatusActionKind, ReservationActionDescriptor> =
  {
    confirm: CONFIRM,
    cancel: CANCEL,
  };

export const RESERVATION_ACTION_PILLS: Record<ReservationActionKind, ReservationActionPill> = {
  confirm: CONFIRM,
  cancel: CANCEL,
  complete: COMPLETE,
};

export const RESERVATION_ACTIONS_BY_STATUS: Record<
  ScheduleStatus,
  readonly ReservationActionKind[]
> = {
  pending: ['confirm', 'cancel'],
  confirmed: ['complete', 'cancel'],
  completed: [],
  cancelled: [],
};
