export interface CreateProductProps {
  name: string;
  brand: string;
  color?: string | null;
  isAvailable?: boolean;
}

export interface ReconstituteProductProps {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}