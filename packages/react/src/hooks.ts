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
