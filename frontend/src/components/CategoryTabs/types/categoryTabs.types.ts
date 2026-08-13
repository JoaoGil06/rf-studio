import type { CategoryDescriptor } from '../../../utils/constants/categories';

export interface CategoryTabsProps {
  categories: readonly CategoryDescriptor[];
  activeSlug: string;
  onSelect: (category: CategoryDescriptor) => void;
  label: string;
}

export interface CategoryTabProps {
  category: CategoryDescriptor;
  isActive: boolean;
  onSelect: (category: CategoryDescriptor) => void;
}
