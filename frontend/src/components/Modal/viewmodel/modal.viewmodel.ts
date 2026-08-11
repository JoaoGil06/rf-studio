import { useCallback, useEffect, useId, useRef } from 'react';
import type { MouseEvent } from 'react';
import type { UseModalViewModelParams } from '../types/modal.types';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
]
  .map((selector) => `${selector}:not([hidden])`)
  .join(', ');

function focusableWithin(sheet: HTMLElement | null): HTMLElement[] {
  if (!sheet) {
    return [];
  }

  return Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export function useModalViewModel({ isOpen, onClose }: UseModalViewModelParams) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const [firstOnOpen] = focusableWithin(sheetRef.current);
    (firstOnOpen ?? sheetRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusable = focusableWithin(sheetRef.current);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, [isOpen, onClose]);

  const handleScrimClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return { sheetRef, titleId, handleScrimClick };
}
