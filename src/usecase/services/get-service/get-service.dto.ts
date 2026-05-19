export interface ServiceNodeDto {
  id: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  createdAt: string;
}

export interface GetServiceInputDto {
  id: string;
}

export type GetServiceOutputDto = ServiceNodeDto;
