export interface ServiceNodeDto {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  createdAt: string;
}

export interface UpdateServiceInputDto {
  id: string;
  name?: string;
  category?: string;
  price?: number;
  durationMinutes?: number;
}

export type UpdateServiceOutputDto = ServiceNodeDto;
