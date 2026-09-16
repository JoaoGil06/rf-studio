import type { ReservationActionKind } from '../../../utils/constants/reservationActions';

export interface ReservationRowAction {
  kind: ReservationActionKind;
  label: string;
  accessibleLabel: string;
  isDanger: boolean;
}

export interface ReservationRowViewModel {
  statusValue: string;
  statusLabel: string;
  title: string;
  serviceName: string;
  when: string;
  description: string;
  actions: readonly ReservationRowAction[];
}

export interface ReservationRowProps {
  id: string;
  onAction: (id: string, kind: ReservationActionKind) => void;
}

export interface ReservationActionPillProps {
  id: string;
  kind: ReservationActionKind;
  label: string;
  accessibleLabel: string;
  isDanger: boolean;
  onAction: (id: string, kind: ReservationActionKind) => void;
}
