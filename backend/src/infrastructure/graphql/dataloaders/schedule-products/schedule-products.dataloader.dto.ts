export interface ScheduleProductDto {
  id: string;
  name: string;
  brand: string;
  category: string;
  color: string | null;
  isAvailable: boolean;
  createdAt: string;
}
