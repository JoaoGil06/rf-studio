import { useCallback, useMemo } from 'react';
import type {
  CategoryTabProps,
  CategoryTabsProps,
  TabDescriptor,
} from '../types/categoryTabs.types';
import styles from './categoryTabs.view.module.css';

function CategoryTab<T extends TabDescriptor>({
  category,
  isActive,
  onSelect,
}: CategoryTabProps<T>) {
  const className = useMemo(
    () => (isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab),
    [isActive],
  );

  const handleClick = useCallback(() => onSelect(category), [onSelect, category]);

  return (
    <button type="button" className={className} aria-pressed={isActive} onClick={handleClick}>
      {category.label}
    </button>
  );
}

export function CategoryTabs<T extends TabDescriptor>({
  categories,
  activeSlug,
  onSelect,
  label,
}: CategoryTabsProps<T>) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
      {categories.map((category) => (
        <CategoryTab
          key={category.slug}
          category={category}
          isActive={category.slug === activeSlug}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
