import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { AVAILABILITY_LABELS } from '../../ProductCard/viewmodel/productCard.viewmodel';
import type { ProductFormProps } from '../types/productForm.types';
import styles from './productForm.view.module.css';

const NAME_ERROR_ID = 'product-name-error';
const BRAND_ERROR_ID = 'product-brand-error';
const COLOR_ERROR_ID = 'product-color-error';

export function ProductForm({
  category,
  register,
  control,
  errors,
  onSubmit,
  formError,
  isSubmitting,
}: ProductFormProps) {
  const submitLabel = useMemo(() => (isSubmitting ? 'A ADICIONAR…' : 'ADICIONAR'), [isSubmitting]);

  const isSwatch = useMemo(() => category.colourControl === 'swatch', [category.colourControl]);

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="product-name">
          Nome
        </label>
        <input
          className={styles.input}
          id="product-name"
          type="text"
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? NAME_ERROR_ID : undefined}
          {...register('name')}
        />
        {errors.name && (
          <span className={styles.fieldError} id={NAME_ERROR_ID}>
            {errors.name.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="product-brand">
          Marca
        </label>
        <input
          className={styles.input}
          id="product-brand"
          type="text"
          autoComplete="off"
          aria-invalid={errors.brand ? true : undefined}
          aria-describedby={errors.brand ? BRAND_ERROR_ID : undefined}
          {...register('brand')}
        />
        {errors.brand && (
          <span className={styles.fieldError} id={BRAND_ERROR_ID}>
            {errors.brand.message}
          </span>
        )}
      </div>

      <div className={styles.field}>
        {!isSwatch && (
          <label className={styles.label} htmlFor="product-color">
            {category.colourLabel}
          </label>
        )}
        <input
          className={isSwatch ? styles.swatchInput : styles.input}
          id="product-color"
          type={isSwatch ? 'color' : 'text'}
          autoComplete="off"
          aria-label={isSwatch ? category.colourLabel : undefined}
          title={isSwatch ? category.colourLabel : undefined}
          placeholder={isSwatch ? undefined : category.colourPlaceholder}
          aria-invalid={errors.color ? true : undefined}
          aria-describedby={errors.color ? COLOR_ERROR_ID : undefined}
          {...register('color')}
        />
        {errors.color && (
          <span className={styles.fieldError} id={COLOR_ERROR_ID}>
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
        {submitLabel}
      </button>
    </form>
  );
}
