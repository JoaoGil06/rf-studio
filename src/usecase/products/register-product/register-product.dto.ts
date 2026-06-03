export interface RegisterProductInputDto {
  name: string;
  brand: string;
  color?: string | null;
  isAvailable?: boolean;
}

export interface RegisterProductOutputDto {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  isAvailable: boolean;
  createdAt: string;
}