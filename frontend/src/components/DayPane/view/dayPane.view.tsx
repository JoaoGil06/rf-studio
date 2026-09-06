import { useMemo } from 'react';
import { AGENDA_COPY } from '../../../utils/constants/scheduleMessages';
import { ReservationEntry } from '../../ReservationEntry';
import type { DayPaneProps, DaySlotRowProps } from '../types/dayPane.types';
import styles from './dayPane.view.module.css';

function DaySlotRow({ slot }: DaySlotRowProps) {
  const isFree = useMemo(() => slot.reservationIds.length === 0, [slot.reservationIds.length]);

  const timeClassName = useMemo(
    () => (isFree ? `${styles.time} ${styles.timeFree}` : styles.time),
    [isFree],
  );

  return (
    <div className={styles.slot}>
      <span className={timeClassName}>{slot.time}</span>
      <div className={styles.entries} role={isFree ? undefined : 'list'}>
        {isFree ? (
          <span className={styles.free}>{AGENDA_COPY.freeSlot}</span>
        ) : (
          slot.reservationIds.map((id) => <ReservationEntry key={id} id={id} density="read" />)
        )}
      </div>
    </div>
  );
}

export function DayPane({ dayLabel, countLabel, isClosed, slots }: DayPaneProps) {
  const showsClosedPanel = useMemo(
    () => isClosed && slots.every((slot) => slot.reservationIds.length === 0),
    [isClosed, slots],
  );

  return (
    <section className={styles.pane} aria-label={dayLabel ?? undefined}>
      <div className={styles.head}>
        <h2 className={styles.name}>{dayLabel}</h2>
        <span className={styles.count}>{countLabel}</span>
      </div>

      {showsClosedPanel ? (
        <p className={styles.closed}>{AGENDA_COPY.closedDay}</p>
      ) : (
        <div className={styles.list}>
          {slots.map((slot) => (
            <DaySlotRow key={slot.time} slot={slot} />
          ))}
        </div>
      )}
    </section>
  );
}
