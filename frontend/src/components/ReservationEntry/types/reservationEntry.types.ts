export type EntryDensity = 'dense' | 'read';

export interface ReservationEntryViewModel {
  label: string;
  description: string;
  statusValue: string;
}

export interface ReservationEntryProps {
  id: string;
  density: EntryDensity;
}
