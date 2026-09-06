import { CalendarMonthGrid } from '../../../components/CalendarMonthGrid';
import { CalendarWeekStrip } from '../../../components/CalendarWeekStrip';
import { DayPane } from '../../../components/DayPane';
import { Loader } from '../../../components/Loader';
import { ChevronLeftIcon, ChevronRightIcon } from '../../../components/icons';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { STATION_QUERY } from '../../../utils/constants/compositions';
import { AGENDA_COPY } from '../../../utils/constants/scheduleMessages';
import { useAgendaViewModel } from '../viewmodel/agenda.viewmodel';
import styles from './agenda.view.module.css';

export function AgendaView() {
  const {
    monthLabel,
    monthDescription,
    goToPreviousMonth,
    goToNextMonth,
    selectDay,
    monthDays,
    weeks,
    selectedKey,
    dayLabel,
    dayCountLabel,
    isSelectedDayClosed,
    daySlots,
    stats,
    statuses,
    isLoading,
    loadError,
  } = useAgendaViewModel();

  const isStation = useMediaQuery(STATION_QUERY);

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div className={styles.month}>
          <div className={styles.whisper} aria-hidden="true">
            {AGENDA_COPY.whisper}
          </div>
          <div className={styles.monthNav} role="group" aria-label={monthDescription}>
            <button
              type="button"
              className={styles.arrow}
              aria-label={AGENDA_COPY.previousMonth}
              onClick={goToPreviousMonth}
            >
              <ChevronLeftIcon className={styles.arrowIcon} />
            </button>
            <h1 className={styles.display} aria-live="polite">
              {monthLabel}
            </h1>
            <button
              type="button"
              className={styles.arrow}
              aria-label={AGENDA_COPY.nextMonth}
              onClick={goToNextMonth}
            >
              <ChevronRightIcon className={styles.arrowIcon} />
            </button>
          </div>
        </div>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>{AGENDA_COPY.statReservations}</dt>
            <dd className={styles.statValue}>{stats.reservations}</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>{AGENDA_COPY.statPending}</dt>
            <dd className={`${styles.statValue} ${styles.statValueAccent}`}>{stats.pending}</dd>
          </div>
          <div className={styles.stat}>
            <dt className={styles.statLabel}>{AGENDA_COPY.statRevenue}</dt>
            <dd className={styles.statValue}>{stats.revenue}</dd>
          </div>
        </dl>
      </div>

      <ul className={styles.legend} aria-label={AGENDA_COPY.legendLabel}>
        {statuses.map((status) => (
          <li key={status.value} className={styles.legendItem}>
            <span className={styles.legendDot} data-status={status.value} aria-hidden="true" />
            {status.label}
          </li>
        ))}
      </ul>

      {loadError && (
        <p className={styles.loadError} role="alert">
          {loadError}
        </p>
      )}

      {isLoading && <Loader />}

      <div className={styles.body}>
        <CalendarWeekStrip weeks={weeks} selectedKey={selectedKey} onSelectDay={selectDay} />
        <CalendarMonthGrid days={monthDays} isDaySelectable={isStation} onSelectDay={selectDay} />
        <DayPane
          dayLabel={dayLabel}
          countLabel={dayCountLabel}
          isClosed={isSelectedDayClosed}
          slots={daySlots}
        />
      </div>
    </main>
  );
}
