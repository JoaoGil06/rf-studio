import { useId, useMemo } from 'react';
import { BOOKING_COPY } from '../../../utils/constants/scheduleMessages';
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
  const serviceErrorId = `${serviceId}-error`;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <p className={styles.note}>{BOOKING_COPY.pendingNote}</p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={serviceId}>
          {BOOKING_COPY.serviceLabel}
        </label>
        <select
          className={styles.select}
          id={serviceId}
          aria-invalid={errors.serviceId ? true : undefined}
          aria-describedby={errors.serviceId ? serviceErrorId : undefined}
          {...register('serviceId')}
        >
          <option value="" disabled hidden>
            {BOOKING_COPY.choosePlaceholder}
          </option>
          {serviceGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.serviceId && (
          <span className={styles.fieldError} id={serviceErrorId}>
            {errors.serviceId.message}
          </span>
        )}
      </div>

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
