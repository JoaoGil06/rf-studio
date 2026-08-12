import { useMemo } from 'react';
import { PRODUCT_CATEGORIES } from '../../../utils/constants/productCategories';
import { useProductCardModel } from '../model/productCard.model';
import type { ProductCardViewModel } from '../types/productCard.types';

const HEX_COLOUR = /^#[0-9a-f]{6}$/i;

export const AVAILABILITY_LABELS = {
  available: 'DISPONÍVEL',
  unavailable: 'INDISPONÍVEL',
} as const;

/** The verb half of each action's accessible name; the product supplies the rest. */
export const ACTION_LABELS = {
  edit: 'Editar',
  delete: 'Remover',
} as const;

export function useProductCardViewModel(id: string): ProductCardViewModel | null {
  const { product } = useProductCardModel(id);

  return useMemo(() => {
    if (!product) {
      return null;
    }

    const category = PRODUCT_CATEGORIES.find((entry) => entry.value === product.category);
    const availability = product.isAvailable
      ? AVAILABILITY_LABELS.available
      : AVAILABILITY_LABELS.unavailable;

    const swatchColour = product.color && HEX_COLOUR.test(product.color) ? product.color : null;

    return {
      name: product.name,
      brand: product.brand,
      swatchColour,
      initial: product.name.trim().charAt(0).toUpperCase() || '?',
      metaLabel: [category?.label, availability].filter(Boolean).join(' · '),
      isAvailable: product.isAvailable,
      swatchLabel: product.color ? `Cor: ${product.color}` : 'Sem cor definida',
      // Naming the buttons after the product is the ViewModel's job: a row of 25
      // identical "Editar" is unreachable by voice and meaningless to a screen reader.
      editLabel: `${ACTION_LABELS.edit} ${product.name}`,
      deleteLabel: `${ACTION_LABELS.delete} ${product.name}`,
    };
  }, [product]);
}
