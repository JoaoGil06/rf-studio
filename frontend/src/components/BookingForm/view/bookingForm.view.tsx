import { useId, useMemo } from 'react';
import { BOOKING_COPY } from '../../../utils/constants/scheduleMessages';
import { ServicePicker } from '../../ServicePicker';
import type { BookingFormProps } from '../types/bookingForm.types';
import styles from './bookingForm.view.module.css';

export function BookingForm({
  register,
  errors,
  onSubmit,
  formError,
  isSubmitting,
  slots,
  isTimeLocked,
  clients,
  serviceGroups,
  chosenServices,
  serviceSummary,
  onAddService,
  onRemoveService,
  truncatedNote,
  submitLabel,
  busyLabel,
}: BookingFormProps) {
  const label = useMemo(
    () => (isSubmitting ? busyLabel : submitLabel),
    [isSubmitting, busyLabel, submitLabel],
  );

  const timePlaceholder = useMemo(
    () => (isTimeLocked ? BOOKING_COPY.timeLockedPlaceholder : BOOKING_COPY.choosePlaceholder),
    [isTimeLocked],
  );

  const fieldId = useId();
  const timeId = `${fieldId}-time`;
  const clientId = `${fieldId}-client`;
  const serviceId = `${fieldId}-service`;
  const timeErrorId = `${timeId}-error`;
  const clientErrorId = `${clientId}-error`;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <p className={styles.note}>{BOOKING_COPY.pendingNote}</p>

      <ServicePicker
        id={serviceId}
        label={BOOKING_COPY.serviceLabel}
        placeholder={BOOKING_COPY.addServicePlaceholder}
        groups={serviceGroups}
        chosen={chosenServices}
        removeVerb={BOOKING_COPY.removeServiceVerb}
        summary={serviceSummary}
        error={errors.serviceIds?.message}
        onAdd={onAddService}
        onRemove={onRemoveService}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor={clientId}>
          {BOOKING_COPY.clientLabel}
        </label>
        <select
          className={styles.select}
          id={clientId}
          aria-invalid={errors.userId ? true : undefined}
          aria-describedby={errors.userId ? clientErrorId : undefined}
          {...register('userId')}
        >
          <option value="" disabled hidden>
            {BOOKING_COPY.choosePlaceholder}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.userId && (
          <span className={styles.fieldError} id={clientErrorId}>
            {errors.userId.message}
          </span>
        )}
        {truncatedNote && <span className={styles.note}>{truncatedNote}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={timeId}>
          {BOOKING_COPY.timeLabel}
        </label>
        <select
          className={styles.select}
          id={timeId}
          disabled={isTimeLocked}
          aria-invalid={errors.time ? true : undefined}
          aria-describedby={errors.time ? timeErrorId : undefined}
          {...register('time')}
        >
          <option value="" disabled hidden>
            {timePlaceholder}
          </option>
          {slots.map((slot) => (
            <option key={slot.time} value={slot.time} disabled={slot.isTaken}>
              {slot.label}
            </option>
          ))}
        </select>
        {errors.time && (
          <span className={styles.fieldError} id={timeErrorId}>
            {errors.time.message}
          </span>
        )}
      </div>

      {formError && (
        <div className={styles.formError} role="alert">
          {formError}
        </div>
      )}

      <button className={styles.submit} type="submit" disabled={isSubmitting}>
        {label}
      </button>
    </form>
  );
}
