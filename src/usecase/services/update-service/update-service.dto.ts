export interface ServiceNodeDto {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  createdAt: string;
}

export interface InputUpdateServiceDto {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  durationMinutes?: number;
}

export type OutputUpdateServiceDto = ServiceNodeDto;
