import type { ProductCategory } from '../../../utils/constants/productCategories';

export interface CategoryTabsProps {
  categories: readonly ProductCategory[];
  activeSlug: string;
  onSelect: (category: ProductCategory) => void;
  label: string;
}

export interface CategoryTabProps {
  category: ProductCategory;
  isActive: boolean;
  onSelect: (category: ProductCategory) => void;
}
