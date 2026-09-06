import { useCallback, useMemo } from 'react';
import { WEEKDAY_HEADS } from '../../../lib/format/date';
import { AGENDA_COPY } from '../../../utils/constants/scheduleMessages';
import { ReservationEntry } from '../../ReservationEntry';
import type { CalendarMonthGridProps, MonthDayCellProps } from '../types/calendarMonthGrid.types';
import styles from './calendarMonthGrid.view.module.css';

function MonthDayCell({ day, isSelectable, onSelect }: MonthDayCellProps) {
  const className = useMemo(() => {
    const parts = [styles.day];

    if (day.isClosed) {
      parts.push(styles.closed);
    } else if (day.isToday) {
      parts.push(styles.today);
    }

    if (day.isOutsideMonth) {
      parts.push(styles.outside);
    }

    if (day.isSelected) {
      parts.push(styles.selected);
    }

    return parts.join(' ');
  }, [day.isClosed, day.isToday, day.isOutsideMonth, day.isSelected]);

  const numberClassName = useMemo(
    () => (day.isToday ? `${styles.number} ${styles.numberToday}` : styles.number),
    [day.isToday],
  );

  const handleSelect = useCallback(() => onSelect(day.key), [onSelect, day.key]);

  const body = (
    <>
      <span className={styles.head}>
        <span className={numberClassName}>{day.dayOfMonth}</span>
        {day.count !== null && <span className={styles.count}>{day.count}</span>}
      </span>

      {day.isClosed && <span className={styles.closedLabel}>{AGENDA_COPY.closedDayShort}</span>}

      {!day.isOutsideMonth && day.reservationIds.length > 0 && (
        <span className={styles.chips} role="list">
          {day.reservationIds.map((id) => (
            <ReservationEntry key={id} id={id} density="dense" />
          ))}
        </span>
      )}

      {!day.isOutsideMonth && day.overflow > 0 && (
        <span className={styles.overflow}>{`+${day.overflow}`}</span>
      )}
    </>
  );

  if (isSelectable && !day.isOutsideMonth) {
    return (
      <button
        type="button"
        className={className}
        aria-label={day.description}
        aria-pressed={day.isSelected}
        onClick={handleSelect}
      >
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

export function CalendarMonthGrid({ days, isDaySelectable, onSelectDay }: CalendarMonthGridProps) {
  return (
    <div className={styles.month}>
      {/* The cells carry their own accessible names, so the heads are decoration. */}
      <div className={styles.heads} aria-hidden="true">
        {WEEKDAY_HEADS.map((head) => (
          <div key={head}>{head}</div>
        ))}
      </div>

      <div className={styles.grid}>
        {days.map((day) => (
          <MonthDayCell
            key={day.key}
            day={day}
            isSelectable={isDaySelectable}
            onSelect={onSelectDay}
          />
        ))}
      </div>
    </div>
  );
}
