export interface TabDescriptor {
  slug: string;
  label: string;
}

export interface CategoryTabsProps<T extends TabDescriptor> {
  categories: readonly T[];
  activeSlug: string;
  onSelect: (category: T) => void;
  label: string;
}

export interface CategoryTabProps<T extends TabDescriptor> {
  category: T;
  isActive: boolean;
  onSelect: (category: T) => void;
}
