import type {
  ConfirmTone,
  ReservationActionKind,
} from '../../../utils/constants/reservationActions';

export interface ReservationStatusModalProps {
  scheduleId: string | null;
  kind: ReservationActionKind | null;
  onClose: () => void;
}

export interface ReservationStatusModalViewModel {
  subject: string | null;
  title: string;
  verb: string;
  consequence: string;
  keepLabel: string;
  actLabel: string;
  tone: ConfirmTone;
  isUpdating: boolean;
  confirm: () => Promise<string | null>;
}
