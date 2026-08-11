import { useCallback, useMemo } from 'react';
import type { CategoryTabProps, CategoryTabsProps } from '../types/categoryTabs.types';
import styles from './categoryTabs.view.module.css';

function CategoryTab({ category, isActive, onSelect }: CategoryTabProps) {
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

export function CategoryTabs({ categories, activeSlug, onSelect, label }: CategoryTabsProps) {
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
