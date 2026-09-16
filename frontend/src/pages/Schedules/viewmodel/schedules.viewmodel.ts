import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { SCHEDULES_COPY, SCHEDULES_EMPTY } from '../../../utils/constants/scheduleMessages';
import {
  SCHEDULE_STATUS_TABS,
  STATUS_PARAM,
  type ScheduleStatusTab,
} from '../../../utils/constants/scheduleStatuses';
import { findScheduleStatusBySlug } from '../../../utils/helpers/scheduleStatuses';
import { useSchedulesModel } from '../model/schedules.model';

export function useSchedulesViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = useMemo(
    () => findScheduleStatusBySlug(searchParams.get(STATUS_PARAM)),
    [searchParams],
  );

  const { data, loading, error, isLoadingMore, canLoadMore, loadMore } = useSchedulesModel(
    status.value,
  );

  const selectStatus = useCallback(
    (next: ScheduleStatusTab) => {
      setSearchParams({ [STATUS_PARAM]: next.slug }, { replace: true });
    },
    [setSearchParams],
  );

  const reservationIds = useMemo(
    () => (data?.schedules.edges ?? []).map((edge) => edge.node.id),
    [data],
  );

  const sentinelRef = useInfiniteScroll({ onLoadMore: loadMore, enabled: canLoadMore });

  const emptyState = useMemo(() => SCHEDULES_EMPTY[status.value], [status.value]);

  const loadError = useMemo(() => (error ? SCHEDULES_COPY.load : null), [error]);

  return {
    tabs: SCHEDULE_STATUS_TABS,
    activeSlug: status.slug,
    selectStatus,
    reservationIds,
    sentinelRef,
    emptyState,
    isLoading: loading,
    isLoadingMore,
    loadError,
  };
}
