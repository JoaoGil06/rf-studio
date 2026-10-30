import type { ServiceOption, ServiceOptionGroup } from '../../BookingForm/types/bookingForm.types';

export interface ServicePickerProps {
  id: string;
  label: string;
  placeholder: string;
  /** What can still be added: chosen services have already left these groups. */
  groups: readonly ServiceOptionGroup[];
  chosen: readonly ServiceOption[];
  removeVerb: string;
  /** `2 reservas · 1 h 30 · 45,00 €`, or null below two services. */
  summary: string | null;
  error: string | undefined;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface ChosenServiceProps {
  option: ServiceOption;
  removeVerb: string;
  onRemove: (id: string) => void;
}
