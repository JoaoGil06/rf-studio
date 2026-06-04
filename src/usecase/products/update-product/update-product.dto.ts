export interface ProductNodeDto {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  isAvailable: boolean;
  createdAt: string;
}

export interface UpdateProductInputDto {
  id: string;
  name?: string;
  brand?: string;
  color?: string;
  isAvailable?: boolean;
}

export type UpdateProductOutputDto = ProductNodeDto;
