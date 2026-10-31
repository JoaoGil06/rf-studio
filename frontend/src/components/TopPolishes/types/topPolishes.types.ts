export interface TopPolish {
  id: string;
  label: string;
  colour: string;
  count: string;
  barPercent: number;
}

export interface TopPolishesProps {
  polishes: readonly TopPolish[];
}

export interface TopPolishRowProps {
  polish: TopPolish;
}
