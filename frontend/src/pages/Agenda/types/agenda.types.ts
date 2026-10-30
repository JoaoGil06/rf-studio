export interface ScheduleEntry {
  id: string;
  time: string;
  status: string;
  finalPrice: number;
  tip: number | null;
  durationMinutes: number;
}

/**
 * Helpers
 */

export interface ScheduleRecord {
  id: string;
  date: string;
  status: string;
  finalPrice: number;
  tip?: number | null;
  service: { durationMinutes: number };
}

export interface ClientEdge {
  node: { id: string; name: string };
}

export interface ServiceEdge {
  node: { id: string; name: string; category: string; price: number; durationMinutes: number };
}

export interface AgendaStats {
  reservations: string;
  pending: string;
  revenue: string;
}
