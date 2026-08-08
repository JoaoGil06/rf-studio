function warnStorageFailure(scope: string, operation: string, error: unknown): void {
  if (!import.meta.env.DEV) return;

  console.warn(
    `[${scope}] ${operation} failed — this will not survive a refresh. ` +
      `Check whether site data is blocked for this origin.`,
    error,
  );
}

export interface StorageGuard {
  /** Runs a read, yielding `fallback` when the browser or the stored value refuses. */
  read<T>(operation: string, run: () => T, fallback: T): T;
  /** Runs a write or a removal — there is nothing to return and nothing to retry. */
  mutate(operation: string, run: () => void): void;
}

export function createStorageGuard(scope: string): StorageGuard {
  return {
    read(operation, run, fallback) {
      try {
        return run();
      } catch (error) {
        warnStorageFailure(scope, operation, error);
        return fallback;
      }
    },

    mutate(operation, run) {
      try {
        run();
      } catch (error) {
        warnStorageFailure(scope, operation, error);
      }
    },
  };
}
