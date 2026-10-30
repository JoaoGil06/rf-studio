export interface ProductOption {
  id: string;
  name: string;
  brand: string;
  category: string;
  swatchColour: string | null;
  /** Free-text tone of a brow product; null when the colour is a swatch. */
  tone: string | null;
}

export interface ProductOptionGroup {
  label: string;
  options: readonly ProductOption[];
}

export interface ProductPickerProps {
  id: string;
  label: string;
  placeholder: string;
  groups: readonly ProductOptionGroup[];
  chosen: readonly ProductOption[];
  removeVerb: string;
  isDisabled: boolean;
  error: string | undefined;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export interface ChosenProductProps {
  option: ProductOption;
  removeVerb: string;
  onRemove: (id: string) => void;
}
