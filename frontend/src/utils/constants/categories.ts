export type CategoryValue = 'nails' | 'eyebrows';
export type CategorySlug = 'unhas' | 'sobrancelhas';

export interface CategoryDescriptor {
  value: CategoryValue;
  slug: CategorySlug;
  label: string;
  noun: string;
}

export const CATEGORY_PARAM = 'categoria';

export function findBySlug<T extends CategoryDescriptor>(
  categories: readonly T[],
  slug: string | null,
  fallback: T,
): T {
  return categories.find((category) => category.slug === slug) ?? fallback;
}
