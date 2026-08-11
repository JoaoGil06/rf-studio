import { vi } from 'vitest';

export interface FakeObserver {
  /** The element handed to `observe()`, or null if nothing was observed. */
  target: Element | null;
  /** Reports the target as intersecting, which is what drives the next page. */
  fire: () => void;
}

/**
 * jsdom ships no IntersectionObserver. Since the sentinel is an inert element with
 * no control to click, installing this stub and firing it by hand is the only way a
 * test can page a list — so anything about pagination has to go through here.
 *
 * Returns the observers constructed so far. An empty array is a result, not a
 * failure to set up: the hook builds no observer while it is disabled, which is how
 * "the last page is in" and "a page is already in flight" look from the outside.
 *
 * Pair with `vi.unstubAllGlobals()` in an `afterEach`.
 */
export function stubIntersectionObserver(): FakeObserver[] {
  const observers: FakeObserver[] = [];

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private readonly entry: FakeObserver;

      constructor(callback: IntersectionObserverCallback) {
        this.entry = {
          target: null,
          fire: () =>
            callback(
              [{ isIntersecting: true } as IntersectionObserverEntry],
              this as unknown as IntersectionObserver,
            ),
        };
        observers.push(this.entry);
      }

      observe(target: Element) {
        this.entry.target = target;
      }

      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );

  return observers;
}
