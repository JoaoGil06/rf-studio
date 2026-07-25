export interface ProductNodeDto {
  id: string;
  name: string;
  brand: string;
  category: string;
  color: string | null;
  isAvailable: boolean;
  createdAt: string;
}

export interface GetProductInputDto {
  id: string;
}

export type GetProductOutputDto = ProductNodeDto;
