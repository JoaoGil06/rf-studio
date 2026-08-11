import {
  DEFAULT_PRODUCT_CATEGORY,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '../constants/productCategories';

/**
 * Falls back rather than throwing: `?categoria=banana` is a URL a human can type,
 * and a 404 for a mistyped tab would be a worse answer than the first tab.
 */
export function findCategoryBySlug(slug: string | null): ProductCategory {
  return PRODUCT_CATEGORIES.find((category) => category.slug === slug) ?? DEFAULT_PRODUCT_CATEGORY;
}
