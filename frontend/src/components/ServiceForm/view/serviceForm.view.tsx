import { useId, useMemo } from 'react';
import type { ServiceFormProps } from '../types/serviceForm.types';
import styles from './serviceForm.view.module.css';

export function ServiceForm({
  register,
  errors,
  onSubmit,
  formError,
  isSubmitting,
  submitLabel,
  busyLabel,
}: ServiceFormProps) {
  const label = useMemo(
    () => (isSubmitting ? busyLabel : submitLabel),
    [isSubmitting, busyLabel, submitLabel],
  );

  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const priceId = `${fieldId}-price`;
  const durationId = `${fieldId}-duration`;
  const nameErrorId = `${nameId}-error`;
  const priceErrorId = `${priceId}-error`;
  const durationErrorId = `${durationId}-error`;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={nameId}>
          Nome
        </label>
        <input
          className={styles.input}
          id={nameId}
          type="text"
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? nameErrorId : undefined}
          {...register('name')}
        />
        {errors.name && (
          <span className={styles.fieldError} id={nameErrorId}>
            {errors.name.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={priceId}>
          Preço (€)
        </label>
        <input
          className={styles.input}
          id={priceId}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          autoComplete="off"
          aria-invalid={errors.price ? true : undefined}
          aria-describedby={errors.price ? priceErrorId : undefined}
          {...register('price', { valueAsNumber: true })}
        />
        {errors.price && (
          <span className={styles.fieldError} id={priceErrorId}>
            {errors.price.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={durationId}>
          Duração (minutos)
        </label>
        <input
          className={styles.input}
          id={durationId}
          type="number"
          inputMode="numeric"
          min="1"
          step="5"
          autoComplete="off"
          aria-invalid={errors.durationMinutes ? true : undefined}
          aria-describedby={errors.durationMinutes ? durationErrorId : undefined}
          {...register('durationMinutes', { valueAsNumber: true })}
        />
        {errors.durationMinutes && (
          <span className={styles.fieldError} id={durationErrorId}>
            {errors.durationMinutes.message}
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
