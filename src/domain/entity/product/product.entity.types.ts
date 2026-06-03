export interface ProductProps {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}