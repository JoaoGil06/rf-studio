import { formatEuros } from '../../../../lib/format/money';
import type { AgendaStats, ScheduleEntry } from '../../types/agenda.types';
import { activeOf } from './scheduleEntries';

const UNKNOWN_REVENUE = '—';

export function toAgendaStats(byDay: Map<string, ScheduleEntry[]>): AgendaStats {
  const entries = [...byDay.values()].flat();
  const revenue = entries
    .filter((entry) => entry.status === 'completed')
    .reduce((total, entry) => total + entry.finalPrice, 0);

  return {
    reservations: String(activeOf(entries).length),
    pending: String(entries.filter((entry) => entry.status === 'pending').length),
    revenue: formatEuros(revenue) ?? UNKNOWN_REVENUE,
  };
}
