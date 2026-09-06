import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Reads a CSS media query from logic — and only where a *behaviour* differs, never
 * to reproduce layout a stylesheet already handles. DESIGN.md holds the query string
 * once in `utils/constants/compositions.ts`; pass it from there, never a literal.
 *
 * `useSyncExternalStore` because a `MediaQueryList` already *is* a subscribe/snapshot
 * pair. A `useState` + `useEffect` version is wrong on the first render, which on the
 * Agenda is a day cell that is briefly the wrong kind of element.
 *
 * Lives in `hooks/` beside `useInfiniteScroll`: a cross-cutting DOM concern with no
 * GraphQL and no markup of its own.
 */
export function useMediaQuery(query: string): boolean {
  const list = useMemo(
    () =>
      typeof window === 'undefined' || typeof window.matchMedia !== 'function'
        ? null
        : window.matchMedia(query),
    [query],
  );

  const subscribe = useCallback(
    (onChange: () => void) => {
      list?.addEventListener('change', onChange);

      return () => list?.removeEventListener('change', onChange);
    },
    [list],
  );

  return useSyncExternalStore(
    subscribe,
    () => list?.matches ?? false,
    () => false,
  );
}
