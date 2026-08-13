import type { CategoryDescriptor } from './categories';

/**
 * A product category is a category plus how its colour is captured. The three
 * names live in `categories.ts`; only the colour control is products' own.
 */
export interface ProductCategory extends CategoryDescriptor {
  /**
   * A verniz colour is a hex and takes the documented swatch field; a brow
   * product's colour is a shade name and takes a text field. This is the only
   * real difference between the two forms.
   */
  colourControl: 'swatch' | 'text';
  colourLabel: string;
  colourPlaceholder: string;
  colourDefault: string;
}

const NAILS: ProductCategory = {
  value: 'nails',
  slug: 'unhas',
  label: 'UNHAS',
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
  noun: 'produto',
  colourControl: 'text',
  colourLabel: 'Tom',
  colourPlaceholder: 'Ex.: castanho médio',
  colourDefault: '',
};

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [NAILS, EYEBROWS];

/**
 * Named rather than `PRODUCT_CATEGORIES[0]`: `noUncheckedIndexedAccess` would
 * widen the index read to `ProductCategory | undefined` for no benefit.
 */
export const DEFAULT_PRODUCT_CATEGORY: ProductCategory = NAILS;
