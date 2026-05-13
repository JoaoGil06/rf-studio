import { Price } from '../../@shared/value-object/price/price.vo.js';
import { ServiceCategory } from '../../@shared/value-object/service-category/service-category.vo.js';

export interface ServiceProps {
  id: string;
  name: string;
  category: ServiceCategory;
  price: Price;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}
