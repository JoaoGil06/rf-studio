import { findBySlug } from '../constants/categories';
import {
  DEFAULT_PRODUCT_CATEGORY,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '../constants/productCategories';

export function findCategoryBySlug(slug: string | null): ProductCategory {
  return findBySlug(PRODUCT_CATEGORIES, slug, DEFAULT_PRODUCT_CATEGORY);
}
