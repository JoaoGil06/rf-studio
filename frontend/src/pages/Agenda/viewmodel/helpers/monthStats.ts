import { formatEuros } from '../../../../lib/format/money';
import { sumRevenue } from '../../../../lib/revenue';
import type { AgendaStats, ScheduleEntry } from '../../types/agenda.types';
import { activeOf } from './scheduleEntries';

const UNKNOWN_REVENUE = '—';

export function toAgendaStats(byDay: Map<string, ScheduleEntry[]>): AgendaStats {
  const entries = [...byDay.values()].flat();
  const revenue = sumRevenue(entries.filter((entry) => entry.status === 'completed'));

  return {
    reservations: String(activeOf(entries).length),
    pending: String(entries.filter((entry) => entry.status === 'pending').length),
    revenue: formatEuros(revenue) ?? UNKNOWN_REVENUE,
  };
}
