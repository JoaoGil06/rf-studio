export interface CreateProductProps {
  name: string;
  brand: string;
  category: string;
  color?: string | null;
  isAvailable?: boolean;
}

export interface ReconstituteProductProps {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
