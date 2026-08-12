import { useId, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { AVAILABILITY_LABELS } from '../../ProductCard/viewmodel/productCard.viewmodel';
import type { ProductFormProps } from '../types/productForm.types';
import styles from './productForm.view.module.css';

export function ProductForm({
  category,
  register,
  control,
  errors,
  onSubmit,
  formError,
  isSubmitting,
  submitLabel,
  busyLabel,
}: ProductFormProps) {
  const label = useMemo(
    () => (isSubmitting ? busyLabel : submitLabel),
    [isSubmitting, busyLabel, submitLabel],
  );

  const isSwatch = useMemo(() => category.colourControl === 'swatch', [category.colourControl]);

  /**
   * Derived rather than literal: two ProductForms can now be mounted at once — the
   * add sheet and the edit sheet are separate components — and duplicate ids would
   * silently point every label at the first form's fields. The old literals were
   * safe only because `Modal` renders null when closed, which is a guarantee held
   * one component away from the ids that depended on it.
   */
  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const brandId = `${fieldId}-brand`;
  const colorId = `${fieldId}-color`;
  const nameErrorId = `${nameId}-error`;
  const brandErrorId = `${brandId}-error`;
  const colorErrorId = `${colorId}-error`;

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
        <label className={styles.label} htmlFor={brandId}>
          Marca
        </label>
        <input
          className={styles.input}
          id={brandId}
          type="text"
          autoComplete="off"
          aria-invalid={errors.brand ? true : undefined}
          aria-describedby={errors.brand ? brandErrorId : undefined}
          {...register('brand')}
        />
        {errors.brand && (
          <span className={styles.fieldError} id={brandErrorId}>
            {errors.brand.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        {!isSwatch && (
          <label className={styles.label} htmlFor={colorId}>
            {category.colourLabel}
          </label>
        )}
        <input
          className={isSwatch ? styles.swatchInput : styles.input}
          id={colorId}
          type={isSwatch ? 'color' : 'text'}
          autoComplete="off"
          aria-label={isSwatch ? category.colourLabel : undefined}
          title={isSwatch ? category.colourLabel : undefined}
          placeholder={isSwatch ? undefined : category.colourPlaceholder}
          aria-invalid={errors.color ? true : undefined}
          aria-describedby={errors.color ? colorErrorId : undefined}
          {...register('color')}
        />
        {errors.color && (
          <span className={styles.fieldError} id={colorErrorId}>
            {errors.color.message}
          </span>
        )}
      </div>

      <Controller
        name="isAvailable"
        control={control}
        render={({ field }) => (
          <button
            type="button"
            className={
              field.value ? `${styles.pill} ${styles.pillOn}` : `${styles.pill} ${styles.pillOff}`
            }
            aria-pressed={field.value}
            onClick={() => field.onChange(!field.value)}
            onBlur={field.onBlur}
            ref={field.ref}
          >
            {field.value ? AVAILABILITY_LABELS.available : AVAILABILITY_LABELS.unavailable}
          </button>
        )}
      />

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
