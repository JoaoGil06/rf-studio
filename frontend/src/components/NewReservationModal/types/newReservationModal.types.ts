import type {
  BookingDay,
  ClientOption,
  ServiceOptionGroup,
} from '../../BookingForm/types/bookingForm.types';

export interface NewReservationModalProps {
  day: BookingDay | null;
  clients: readonly ClientOption[];
  serviceGroups: readonly ServiceOptionGroup[];
  truncatedNote: string | null;
  onClose: () => void;
}
