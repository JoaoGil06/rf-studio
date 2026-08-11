export interface ProductCardViewModel {
  name: string;
  brand: string;
  swatchColour: string | null;
  initial: string;
  metaLabel: string;
  isAvailable: boolean;
  swatchLabel: string;
}

export interface ProductCardProps {
  id: string;
}
