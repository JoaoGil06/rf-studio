import type { FormEventHandler } from 'react';
import type { DefaultValues, FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import type { TimeSpan } from '../../../lib/date/slots';

export const bookingSchema = z.object({
  time: z.string().min(1, 'Escolha a hora.'),
  userId: z.string().min(1, 'Escolha a cliente.'),
  serviceId: z.string().min(1, 'Escolha o serviço.'),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export const bookingFormDefaults: DefaultValues<BookingFormValues> = {
  time: '',
  userId: '',
  serviceId: '',
};

export interface ClientOption {
  id: string;
  name: string;
}

export interface ServiceOption {
  id: string;
  label: string;
  durationMinutes: number;
}

export interface ServiceOptionGroup {
  label: string;
  options: readonly ServiceOption[];
}

export interface BookingSlot {
  time: string;
  isTaken: boolean;
}

export interface BookingDay {
  key: string;
  label: string;
  addLabel: string;
  busy: readonly TimeSpan[];
}

export interface BookingFormProps {
  register: UseFormRegister<BookingFormValues>;
  errors: FieldErrors<BookingFormValues>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  formError: string | null;
  isSubmitting: boolean;
  slots: readonly BookingSlot[];
  isTimeLocked: boolean;
  clients: readonly ClientOption[];
  serviceGroups: readonly ServiceOptionGroup[];
  truncatedNote: string | null;
  submitLabel: string;
  busyLabel: string;
}
