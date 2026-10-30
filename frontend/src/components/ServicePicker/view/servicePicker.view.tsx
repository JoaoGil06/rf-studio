import { useCallback, type ChangeEvent } from 'react';
import { CloseIcon } from '../../icons';
import type { ChosenServiceProps, ServicePickerProps } from '../types/servicePicker.types';
import styles from './servicePicker.view.module.css';

function ChosenService({ option, removeVerb, onRemove }: ChosenServiceProps) {
  const handleRemove = useCallback(() => onRemove(option.id), [onRemove, option.id]);

  return (
    <li className={styles.chosen}>
      <span className={styles.name}>{option.label}</span>
      <button
        type="button"
        className={styles.remove}
        aria-label={`${removeVerb} ${option.label}`}
        onClick={handleRemove}
      >
        <CloseIcon className={styles.removeIcon} />
      </button>
    </li>
  );
}

export function ServicePicker({
  id,
  label,
  placeholder,
  groups,
  chosen,
  removeVerb,
  summary,
  error,
  onAdd,
  onRemove,
}: ServicePickerProps) {
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
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
      >
        <option value="">{placeholder}</option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
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
            <ChosenService
              key={option.id}
              option={option}
              removeVerb={removeVerb}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}

      {summary && <p className={styles.summary}>{summary}</p>}
    </div>
  );
}
