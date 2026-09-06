import { useCallback, useEffect, useMemo, useRef } from 'react';
import { WEEKDAY_HEADS } from '../../../lib/format/date';
import type { CalendarWeekStripProps, WeekStripCellProps } from '../types/calendarWeekStrip.types';
import styles from './calendarWeekStrip.view.module.css';

function WeekStripCell({ day, onSelect }: WeekStripCellProps) {
  const className = useMemo(() => {
    const parts = [styles.cell];

    if (day.isClosed) {
      parts.push(styles.closed);
    }

    if (day.isToday) {
      parts.push(styles.today);
    }

    if (day.isSelected) {
      parts.push(styles.selected);
    }

    if (day.isOutsideMonth) {
      parts.push(styles.outside);
    }

    return parts.join(' ');
  }, [day.isClosed, day.isToday, day.isSelected, day.isOutsideMonth]);

  const numberClassName = useMemo(
    () => (day.isSelected || day.isToday ? `${styles.number} ${styles.numberLive}` : styles.number),
    [day.isSelected, day.isToday],
  );

  const handleSelect = useCallback(() => onSelect(day.key), [onSelect, day.key]);

  return (
    <button
      type="button"
      className={className}
      aria-label={day.description}
      aria-current={day.isSelected ? 'date' : undefined}
      disabled={day.isOutsideMonth}
      onClick={handleSelect}
    >
      <span className={numberClassName}>{day.dayOfMonth}</span>
      <span className={styles.dots} aria-hidden="true">
        {day.dots.map((status, index) => (
          <span key={`${day.key}-${index}`} className={styles.dot} data-status={status} />
        ))}
      </span>
    </button>
  );
}

export function CalendarWeekStrip({ weeks, selectedKey, onSelectDay }: CalendarWeekStripProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);

  const movedForRef = useRef<string | null>(null);

  useEffect(() => {
    const strip = stripRef.current;

    if (!strip || !selectedKey || movedForRef.current === selectedKey) {
      return;
    }

    const index = weeks.findIndex((week) => week.days.some((day) => day.key === selectedKey));

    if (index >= 0) {
      strip.scrollLeft = index * strip.clientWidth;
    }

    movedForRef.current = selectedKey;
  }, [selectedKey, weeks]);

  return (
    <div className={styles.week}>
      <div className={styles.heads} aria-hidden="true">
        {WEEKDAY_HEADS.map((head) => (
          <div key={head}>{head}</div>
        ))}
      </div>

      <div className={styles.strip} ref={stripRef}>
        {weeks.map((week) => (
          <div key={week.key} className={styles.page}>
            {week.days.map((day) => (
              <WeekStripCell key={day.key} day={day} onSelect={onSelectDay} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
