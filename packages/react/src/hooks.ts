import {
  type ActionSpec,
  type Actions,
  type ContainerDef,
  createContainer,
  type DerivedSignals,
  type Interpreters,
  type StateSignals,
  type Store,
} from "@re-reduced/core";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface UseContainerOptions<S, R, I extends { kind: string }> {
  interpreters?: Interpreters<I, Actions<R>>;
  init?: Partial<S>;
}

/**
 * Create a Store once for this component; dispose on unmount.
 *
 * StrictMode-safe: the dev mount→unmount→mount cycle destroys the store on the
 * simulated unmount, so the mount-only effect revives it (and re-renders with
 * the fresh one) if it sees a destroyed store. Empty deps avoid a destroy/revive
 * loop. In production this runs once and never revives.
 */
export function useContainer<
  S extends Record<string, unknown>,
  R extends Record<string, ActionSpec<S, unknown>>,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
>(
  def: ContainerDef<S, R, D, I>,
  opts?: UseContainerOptions<S, R, I>,
): Store<S, R, D> {
  const [store, setStore] = useState(() => createContainer(def, opts));
  const optsRef = useRef(opts);
  optsRef.current = opts;
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only; revives a StrictMode-destroyed store
  useEffect(() => {
    let current = store;
    if (current.destroyed) {
      current = createContainer(def, optsRef.current);
      setStore(current);
    }
    return () => current.destroy();
  }, []);
  return store;
}

/**
 * Subscribe to a derived slice. Backed by useSyncExternalStore over a stable
 * `computed` selector: it auto-tracks only the signals the selector reads, and
 * the component re-renders only when that value changes (ADR-0002 bail-out).
 *
 * Return primitives or stable references — a selector that builds a new object
 * each call defeats the bail-out, same as Redux/Zustand selectors.
 */
export function useSelect<S, R, D extends Record<string, () => unknown>, T>(
  store: Store<S, R, D>,
  selector: (state: StateSignals<S>, derived: DerivedSignals<D>) => T,
): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  // Stable subscribe/getSnapshot per store — uSES requires stable identities,
  // else it re-subscribes every render (and preact's immediate-invoke on
  // subscribe would register as a spurious store change → extra renders).
  const { subscribe, getSnapshot } = useMemo(() => {
    const sig = store.select((s, d) => selectorRef.current(s, d));
    return {
      subscribe: (onChange: () => void) => sig.subscribe(onChange),
      getSnapshot: () => sig.peek(),
    };
  }, [store]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Run an effect when a derived slice changes (renamed from useEffectOn). */
export function useWatch<S, R, D extends Record<string, () => unknown>, T>(
  store: Store<S, R, D>,
  selector: (state: StateSignals<S>, derived: DerivedSignals<D>) => T,
  effectFn: (value: T) => void | (() => void),
): void {
  const value = useSelect(store, selector);
  const effectRef = useRef(effectFn);
  effectRef.current = effectFn;
  useEffect(() => effectRef.current(value), [value]);
}

/** Plain values of the derived block (the computed results, not the thunks). */
export type DerivedValues<D> = {
  [K in keyof D]: D[K] extends () => infer T ? T : never;
};

interface ValueSource {
  peek(): unknown;
  subscribe(run: () => void): () => void;
}

/**
 * Destructuring read. Returns a proxy over state + derived where reading a key
 * during render subscribes the component to THAT key only — the per-field
 * bail-out is preserved, so `const { a } = useStoreValues(store)` re-renders
 * only when `a` changes (same discipline as a primitive `useSelect`).
 *
 * Destructure the keys you read; do NOT spread or `Object.keys` the result —
 * that touches every field and subscribes to all of them.
 */
export function useStoreValues<S, R, D extends Record<string, () => unknown>>(
  store: Store<S, R, D>,
): S & DerivedValues<D> {
  const accessed = useRef<Set<string>>(new Set());
  const snap = useRef<Record<string, unknown>>({});

  const sources = useMemo(
    () =>
      ({ ...store.$state, ...store.$derived }) as Record<string, ValueSource>,
    [store],
  );

  const subscribe = useMemo(
    () => (onChange: () => void) => {
      const unsubs = Object.keys(sources).map((k) =>
        sources[k].subscribe(() => {
          if (accessed.current.has(k)) onChange(); // gate: only accessed keys wake us
        }),
      );
      return () => {
        for (const u of unsubs) u();
      };
    },
    [sources],
  );

  // Stable identity unless an *accessed* value changed → absorbs the spurious
  // immediate-fire on subscribe and keeps useSyncExternalStore from re-rendering
  // on untracked fields.
  const getSnapshot = useMemo(
    () => () => {
      let changed = false;
      for (const k of accessed.current) {
        const v = sources[k].peek();
        if (!Object.is(v, snap.current[k])) {
          snap.current[k] = v;
          changed = true;
        }
      }
      if (changed) snap.current = { ...snap.current };
      return snap.current;
    },
    [sources],
  );

  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return useMemo(
    () =>
      new Proxy({} as S & DerivedValues<D>, {
        get(_t, key) {
          if (typeof key !== "string") return undefined;
          const sig = sources[key];
          if (!sig) return undefined;
          accessed.current.add(key); // tracked from now on
          return sig.peek();
        },
      }),
    [sources],
  );
}
