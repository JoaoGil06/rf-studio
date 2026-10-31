export interface CategorySplitFigures {
  nailsPercent: number;
  browsPercent: number;
  nailsLabel: string;
  browsLabel: string;
}

export interface CategorySplitProps {
  /** `null` when the month earned nothing, so there is nothing to divide. */
  split: CategorySplitFigures | null;
}
