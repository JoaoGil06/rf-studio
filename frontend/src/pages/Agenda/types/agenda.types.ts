export interface ScheduleEntry {
  id: string;
  time: string;
  status: string;
  finalPrice: number;
}

export interface AgendaStats {
  reservations: string;
  pending: string;
  revenue: string;
}
