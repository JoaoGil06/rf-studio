/**
 * One category, three names. The wire value is what the backend enum accepts
 * (`serviceCategoryEnum = ['nails', 'eyebrows']` — note `eyebrows`, not `brows`);
 * the slug is what survives in the URL; the label is what Rita reads. Keeping
 * them in one row is what stops a rename in one place from silently desyncing
 * the other two.
 */
export interface ProductCategory {
  /** The value `registerProduct` and `Product.category` speak. */
  value: 'nails' | 'eyebrows';
  /** The `?categoria=` value. pt-PT, because the URL is part of the product. */
  slug: 'unhas' | 'sobrancelhas';
  /** Tracked capitals, as every nav-adjacent label in the system. */
  label: string;
  /** Singular, for the empty state and the form's aria-labels. */
  noun: string;
  /**
   * A verniz colour is a hex and takes the documented swatch field; a brow
   * product's colour is a shade name and takes a text field. This is the only
   * real difference between the two forms.
   */
  colourControl: 'swatch' | 'text';
  colourLabel: string;
  colourPlaceholder: string;
}

const NAILS: ProductCategory = {
  value: 'nails',
  slug: 'unhas',
  label: 'UNHAS',
  noun: 'verniz',
  colourControl: 'swatch',
  colourLabel: 'Cor do verniz',
  colourPlaceholder: '',
};

const EYEBROWS: ProductCategory = {
  value: 'eyebrows',
  slug: 'sobrancelhas',
  label: 'SOBRANCELHAS',
  noun: 'produto',
  colourControl: 'text',
  colourLabel: 'Tom',
  colourPlaceholder: 'Ex.: castanho médio',
};

export const PRODUCT_CATEGORIES: readonly ProductCategory[] = [NAILS, EYEBROWS];

/**
 * Named rather than `PRODUCT_CATEGORIES[0]`: `noUncheckedIndexedAccess` would
 * widen the index read to `ProductCategory | undefined` for no benefit.
 */
export const DEFAULT_PRODUCT_CATEGORY: ProductCategory = NAILS;

/** The query-string key. Named once so the page and its tests cannot disagree. */
export const CATEGORY_PARAM = 'categoria';
