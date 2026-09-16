import type { ConfirmTone } from '../../../utils/constants/reservationActions';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  name: string;
  keepLabel: string;
  removeLabel: string;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: () => Promise<string | null>;
  verb?: string;
  consequence?: string;
  tone?: ConfirmTone;
}
