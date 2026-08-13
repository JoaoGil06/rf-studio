import { findBySlug } from '../constants/categories';
import {
  DEFAULT_SERVICE_CATEGORY,
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from '../constants/serviceCategories';

export function findServiceCategoryBySlug(slug: string | null): ServiceCategory {
  return findBySlug(SERVICE_CATEGORIES, slug, DEFAULT_SERVICE_CATEGORY);
}
