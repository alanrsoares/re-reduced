/**
 * Core (renderer-agnostic) interpreters — ADR-0006: timeout, storage.
 * The server bridge (query/mutate) lives in the adapter layer, not here.
 */
import type { InterpCtx } from "./container";
import type {
  StorageRemoveIntent,
  StorageSetIntent,
  TimeoutIntent,
} from "./intents";

export const timeoutInterpreter = <A>(
  intent: TimeoutIntent,
  { signal }: InterpCtx<A>,
): (() => void) => {
  const id = setTimeout(() => {
    if (!signal.aborted) intent.run();
  }, intent.ms);
  return () => clearTimeout(id);
};

export interface StorageBackend {
  setItem(key: string, value: string): void;
  /** Needed by `readStored`. */
  getItem?(key: string): string | null;
  /** Needed by `makeStorageRemoveInterpreter`. */
  removeItem?(key: string): void;
}

const defaultBackend = (): StorageBackend | undefined =>
  (globalThis as { localStorage?: StorageBackend }).localStorage;

/** Defaults to globalThis.localStorage; inject a backend for tests/SSR. */
export const makeStorageInterpreter =
  <A>(backend: StorageBackend | undefined = defaultBackend()) =>
  (intent: StorageSetIntent, _ctx: InterpCtx<A>): void => {
    try {
      backend?.setItem(intent.key, JSON.stringify(intent.value));
    } catch {
      // Storage is best-effort: unavailable, full or blocked storage, and
      // unserializable values (BigInt, cycles), must not break a dispatch.
    }
  };

/** Removes a key. Like `makeStorageInterpreter`, it never throws. */
export const makeStorageRemoveInterpreter =
  <A>(backend: StorageBackend | undefined = defaultBackend()) =>
  (intent: StorageRemoveIntent, _ctx: InterpCtx<A>): void => {
    try {
      backend?.removeItem?.(intent.key);
    } catch {
      // best-effort, same as storageSet
    }
  };

/**
 * Read and JSON-parse a stored value, for the `init` option. Returns
 * `undefined` when storage is unavailable, the key is absent, the JSON is
 * invalid, or `parse` rejects the value. `parse` narrows the unknown value,
 * for example `(v) => schema.safeParse(v).data`. It never throws.
 */
export const readStored = <T = unknown>(
  key: string,
  parse?: (value: unknown) => T | undefined,
  backend: StorageBackend | undefined = defaultBackend(),
): T | undefined => {
  try {
    const raw = backend?.getItem?.(key);
    if (raw == null) return undefined;
    const value: unknown = JSON.parse(raw);
    return parse ? parse(value) : (value as T);
  } catch {
    return undefined;
  }
};
