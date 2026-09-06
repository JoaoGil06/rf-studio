import type { CategoryDescriptor } from './categories';

export interface ProductCategory extends CategoryDescriptor {
  colourControl: 'swatch' | 'text';
  colourLabel: string;
  colourPlaceholder: string;
  colourDefault: string;
}

const NAILS: ProductCategory = {
  value: 'nails',
  slug: 'unhas',
  label: 'UNHAS',
  title: 'Unhas',
  noun: 'verniz',
  colourControl: 'swatch',
  colourLabel: 'Cor do verniz',
  colourPlaceholder: '',
  colourDefault: '#000000',
};

const EYEBROWS: ProductCategory = {
  value: 'eyebrows',
  slug: 'sobrancelhas',
  label: 'SOBRANCELHAS',
  title: 'Sobrancelhas',
  noun: 'produto',
  colourControl: 'text',
  colourLabel: 'Tom',
  colourPlaceholder: 'Ex.: castanho médio',
  colourDefault: '',
};

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [NAILS, EYEBROWS];

export const DEFAULT_PRODUCT_CATEGORY: ProductCategory = NAILS;
