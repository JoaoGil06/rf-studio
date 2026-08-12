export interface ProductCardViewModel {
  name: string;
  brand: string;
  swatchColour: string | null;
  initial: string;
  metaLabel: string;
  isAvailable: boolean;
  swatchLabel: string;
  /** "Editar Nude Rosé" — named per product; 25 identical "Editar" is unusable. */
  editLabel: string;
  /** "Remover Nude Rosé". */
  deleteLabel: string;
}

export interface ProductCardProps {
  id: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
