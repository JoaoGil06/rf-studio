import { useMemo } from 'react';
import { AGENDA_COPY, BOOKING_COPY } from '../../../utils/constants/scheduleMessages';
import { PlusIcon } from '../../icons';
import { ReservationEntry } from '../../ReservationEntry';
import type { DayPaneProps, DaySlotRowProps } from '../types/dayPane.types';
import styles from './dayPane.view.module.css';

function DaySlotRow({ slot }: DaySlotRowProps) {
  const isEmpty = useMemo(() => slot.reservationIds.length === 0, [slot.reservationIds.length]);

  const timeClassName = useMemo(() => {
    if (!isEmpty) {
      return styles.time;
    }

    return slot.isCovered
      ? `${styles.time} ${styles.timeCovered}`
      : `${styles.time} ${styles.timeFree}`;
  }, [isEmpty, slot.isCovered]);

  const aside = useMemo(
    () => (slot.isCovered ? AGENDA_COPY.coveredSlot : AGENDA_COPY.freeSlot),
    [slot.isCovered],
  );

  const asideClassName = useMemo(
    () => (slot.isCovered ? styles.covered : styles.free),
    [slot.isCovered],
  );

  return (
    <div className={styles.slot}>
      <span className={timeClassName}>{slot.time}</span>
      <div className={styles.entries} role={isEmpty ? undefined : 'list'}>
        {isEmpty ? (
          <span className={asideClassName}>{aside}</span>
        ) : (
          slot.reservationIds.map((id) => <ReservationEntry key={id} id={id} density="read" />)
        )}
      </div>
    </div>
  );
}

export function DayPane({
  dayLabel,
  countLabel,
  isClosed,
  slots,
  addLabel,
  onAddReservation,
}: DayPaneProps) {
  const showsClosedPanel = useMemo(
    () => isClosed && slots.every((slot) => slot.reservationIds.length === 0),
    [isClosed, slots],
  );

  return (
    <section className={styles.pane} aria-label={dayLabel ?? undefined}>
      <div className={styles.head}>
        <h2 className={styles.name}>{dayLabel}</h2>
        <div className={styles.headEnd}>
          <span className={styles.count}>{countLabel}</span>
          {addLabel && (
            <button
              type="button"
              className={styles.add}
              aria-label={addLabel}
              onClick={onAddReservation}
            >
              <PlusIcon className={styles.addIcon} />
              {BOOKING_COPY.addAction}
            </button>
          )}
        </div>
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
