import type { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  whisper?: string;
  children: ReactNode;
  closeLabel?: string;
}

export interface UseModalViewModelParams {
  isOpen: boolean;
  onClose: () => void;
}
