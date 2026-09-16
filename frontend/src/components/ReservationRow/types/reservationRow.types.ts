export interface ReservationRowViewModel {
  statusValue: string;
  statusLabel: string;
  title: string;
  serviceName: string;
  when: string;
  description: string;
}

export interface ReservationRowProps {
  id: string;
}
