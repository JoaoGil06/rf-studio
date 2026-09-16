import { useCallback, useMemo, useState } from 'react';
import { CategoryTabs } from '../../../components/CategoryTabs';
import { Loader } from '../../../components/Loader';
import { PageHeader } from '../../../components/PageHeader';
import { ReservationRow } from '../../../components/ReservationRow';
import { ReservationStatusModal } from '../../../components/ReservationStatusModal';
import type { ReservationActionKind } from '../../../utils/constants/reservationActions';
import { SCHEDULES_COPY } from '../../../utils/constants/scheduleMessages';
import { useSchedulesViewModel } from '../viewmodel/schedules.viewmodel';
import styles from './schedules.view.module.css';

interface OpenAction {
  id: string;
  kind: ReservationActionKind;
}

export function SchedulesView() {
  const {
    tabs,
    activeSlug,
    selectStatus,
    reservationIds,
    sentinelRef,
    emptyState,
    isLoading,
    isLoadingMore,
    loadError,
  } = useSchedulesViewModel();

  const [openAction, setOpenAction] = useState<OpenAction | null>(null);

  const handleAction = useCallback(
    (id: string, kind: ReservationActionKind) => setOpenAction({ id, kind }),
    [],
  );
  const closeAction = useCallback(() => setOpenAction(null), []);

  const openScheduleId = useMemo(() => openAction?.id ?? null, [openAction]);
  const openKind = useMemo(() => openAction?.kind ?? null, [openAction]);

  const isEmpty = useMemo(
    () => !isLoading && !loadError && reservationIds.length === 0,
    [isLoading, loadError, reservationIds.length],
  );

  const renderLoadError = () => (
    <p className={styles.loadError} role="alert">
      {loadError}
    </p>
  );

  const renderIsEmptyMessage = () => (
    <div className={styles.emptyPanel}>
      <p className={styles.emptyTitle}>{emptyState.title}</p>
      <p className={styles.emptyBody}>{emptyState.body}</p>
    </div>
  );

  return (
    <main className={styles.page}>
      <PageHeader whisper={SCHEDULES_COPY.whisper} title={SCHEDULES_COPY.title}>
        <CategoryTabs
          categories={tabs}
          activeSlug={activeSlug}
          onSelect={selectStatus}
          label={SCHEDULES_COPY.tabsLabel}
        />
      </PageHeader>

      {loadError && renderLoadError()}

      {isEmpty && renderIsEmptyMessage()}

      <div className={styles.list}>
        {reservationIds.map((id) => (
          <ReservationRow key={id} id={id} onAction={handleAction} />
        ))}

        <div className={styles.sentinel} aria-hidden="true" ref={sentinelRef} />
      </div>

      {isLoadingMore && <Loader />}

      <ReservationStatusModal scheduleId={openScheduleId} kind={openKind} onClose={closeAction} />
    </main>
  );
}
