import type { Ref } from 'react';

export interface AddTileProps {
  label: string;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}
