import { vi } from 'vitest';

export interface FakeMatchMedia {
  set: (query: string, matches: boolean) => void;
}

export function stubMatchMedia(matches: Record<string, boolean> = {}): FakeMatchMedia {
  const state = new Map(Object.entries(matches));
  const listeners = new Map<string, Set<() => void>>();

  vi.stubGlobal('matchMedia', (query: string) => ({
    media: query,
    get matches() {
      return state.get(query) ?? false;
    },
    addEventListener: (_event: string, listener: () => void) => {
      const forQuery = listeners.get(query) ?? new Set<() => void>();
      forQuery.add(listener);
      listeners.set(query, forQuery);
    },
    removeEventListener: (_event: string, listener: () => void) => {
      listeners.get(query)?.delete(listener);
    },
  }));

  return {
    set: (query, nextMatches) => {
      state.set(query, nextMatches);
      listeners.get(query)?.forEach((listener) => listener());
    },
  };
}
