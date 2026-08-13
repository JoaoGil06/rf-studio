import { useMemo } from 'react';
import { formatDuration } from '../../../lib/format/duration';
import { formatEuros } from '../../../lib/format/money';
import { SERVICE_CATEGORIES } from '../../../utils/constants/serviceCategories';
import { useServiceCardModel } from '../model/serviceCard.model';
import type { ServiceCardViewModel } from '../types/serviceCard.types';

export const UNKNOWN_PRICE = '—';

export function useServiceCardViewModel(id: string): ServiceCardViewModel | null {
  const { service } = useServiceCardModel(id);

  return useMemo(() => {
    if (!service) {
      return null;
    }

    const category = SERVICE_CATEGORIES.find((entry) => entry.value === service.category);
    const duration = formatDuration(service.durationMinutes);

    return {
      name: service.name,
      initial: service.name.trim().charAt(0).toUpperCase() || '?',
      metaLabel: [category?.label, duration?.toUpperCase()].filter(Boolean).join(' · '),
      price: formatEuros(service.price) ?? UNKNOWN_PRICE,
    };
  }, [service]);
}
