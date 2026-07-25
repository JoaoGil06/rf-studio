export interface RegisterServiceInputDto {
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
}

export interface RegisterServiceOutputDto {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  createdAt: string;
}
