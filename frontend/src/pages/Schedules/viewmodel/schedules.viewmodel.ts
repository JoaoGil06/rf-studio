import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductOption } from '../../../components/ProductPicker/types/productPicker.types';
import type { ScheduleStatus } from '../../../graphql/generated/graphql';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { isHexColour } from '../../../lib/colour';
import { SCHEDULES_COPY, SCHEDULES_EMPTY } from '../../../utils/constants/scheduleMessages';
import {
  SCHEDULE_STATUS_TABS,
  STATUS_PARAM,
  type ScheduleStatusTab,
} from '../../../utils/constants/scheduleStatuses';
import { findScheduleStatusBySlug } from '../../../utils/helpers/scheduleStatuses';
import { useReservationProductsModel, useSchedulesModel } from '../model/schedules.model';

/** Only a confirmed reservation can be completed, so only its tab needs the products. */
const COMPLETABLE_STATUS: ScheduleStatus = 'confirmed';

export function useSchedulesViewModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = useMemo(
    () => findScheduleStatusBySlug(searchParams.get(STATUS_PARAM)),
    [searchParams],
  );

  const { data, loading, error, isLoadingMore, canLoadMore, loadMore } = useSchedulesModel(
    status.value,
  );

  const {
    products,
    hasMoreProducts,
    isLoading: isLoadingProducts,
  } = useReservationProductsModel(status.value === COMPLETABLE_STATUS);

  const productOptions = useMemo<readonly ProductOption[]>(
    () =>
      products
        .filter((edge) => edge.node.isAvailable)
        .map(({ node }) => ({
          id: node.id,
          name: node.name,
          brand: node.brand,
          category: node.category,
          swatchColour: isHexColour(node.color) ? node.color : null,
          tone: node.color && !isHexColour(node.color) ? node.color : null,
        })),
    [products],
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
    productOptions,
    hasMoreProducts,
    isLoadingProducts,
  };
}
