import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_ROOT_MARGIN = '400px';

export interface UseInfiniteScrollParams {
  onLoadMore: () => void;
  enabled: boolean;
  rootMargin?: string;
}

/**
 * Watches a sentinel element and asks for the next page when it approaches the
 * viewport. Returns a **callback ref** rather than a `useRef` object: the sentinel
 * only exists in the DOM while there is a next page, so it mounts and unmounts,
 * and a callback ref is what observes and unobserves at the right moment without
 * an effect that runs before the node exists.
 *
 * Lives in `hooks/` because an IntersectionObserver is neither data nor markup —
 * it is a cross-cutting DOM concern with no GraphQL and no view of its own.
 */
export function useInfiniteScroll({
  onLoadMore,
  enabled,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: UseInfiniteScrollParams) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const connect = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    const node = nodeRef.current;

    if (!node || !enabled || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    observerRef.current = observer;
  }, [enabled, onLoadMore, rootMargin]);

  /**
   * Rebuilding the observer on every `enabled` flip is load-bearing, not tidiness.
   * An IntersectionObserver reports *changes* in intersection: if the sentinel is
   * already on screen when a page finishes loading, re-enabling a still-attached
   * observer produces no further callback and the scroll silently stops paginating.
   * Observing afresh always emits an initial entry, so the chain continues.
   */
  useEffect(() => {
    connect();

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [connect]);

  return useCallback(
    (node: HTMLElement | null) => {
      nodeRef.current = node;
      connect();
    },
    [connect],
  );
}
