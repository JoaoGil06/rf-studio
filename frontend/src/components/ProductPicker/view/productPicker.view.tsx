import { useCallback, useMemo, type ChangeEvent } from 'react';
import { CloseIcon } from '../../icons';
import type { ChosenProductProps, ProductPickerProps } from '../types/productPicker.types';
import styles from './productPicker.view.module.css';

function ChosenProduct({ option, removeVerb, onRemove }: ChosenProductProps) {
  const handleRemove = useCallback(() => onRemove(option.id), [onRemove, option.id]);

  // The polish's own colour is content, not layout — the one inline value here.
  const swatchStyle = useMemo(
    () => (option.swatchColour ? { background: option.swatchColour } : undefined),
    [option.swatchColour],
  );

  return (
    <li className={styles.chosen}>
      {swatchStyle && (
        <span
          className={styles.swatch}
          style={swatchStyle}
          data-testid="swatch"
          aria-hidden="true"
        />
      )}
      <span className={styles.name}>{option.name}</span>
      {option.tone && <span className={styles.tone}>{option.tone}</span>}
      <button
        type="button"
        className={styles.remove}
        aria-label={`${removeVerb} ${option.name}`}
        onClick={handleRemove}
      >
        <CloseIcon className={styles.removeIcon} />
      </button>
    </li>
  );
}

export function ProductPicker({
  id,
  label,
  placeholder,
  groups,
  chosen,
  removeVerb,
  isDisabled,
  error,
  onAdd,
  onRemove,
}: ProductPickerProps) {
  const errorId = `${id}-error`;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => onAdd(event.target.value),
    [onAdd],
  );

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <select
        id={id}
        className={styles.select}
        value=""
        disabled={isDisabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
      >
        <option value="">{placeholder}</option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.tone ? `${option.name} — ${option.tone}` : option.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      {error && (
        <span className={styles.fieldError} id={errorId}>
          {error}
        </span>
      )}

      {chosen.length > 0 && (
        <ul className={styles.list}>
          {chosen.map((option) => (
            <ChosenProduct
              key={option.id}
              option={option}
              removeVerb={removeVerb}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
