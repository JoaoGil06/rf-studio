import { ServiceCategory } from '../../@shared/value-object/service-category/service-category.vo.js';

export interface ProductProps {
  id: string;
  name: string;
  brand: string;
  color: string | null;
  category: ServiceCategory;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProductProps {
  name?: string;
  brand?: string;
  color?: string;
  isAvailable?: boolean;
  category?: string;
}
