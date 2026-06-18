// Importing @preact/signals activates Preact's signal tracking integration:
// reading a signal's `.value` during render fine-grainedly subscribes the
// component, and a signal rendered directly in JSX updates its text node with
// no VDOM diff at all (ADR-0001 native fast path).
import "@preact/signals";
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
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

export interface UseContainerOptions<S, R, I extends { kind: string }> {
  interpreters?: Interpreters<I, Actions<R>>;
  init?: Partial<S>;
}

/** Create a Store once for this component; dispose on unmount. */
export function useContainer<
  S extends Record<string, unknown>,
  R extends Record<string, ActionSpec<S, unknown>>,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
>(
  def: ContainerDef<S, R, D, I>,
  opts?: UseContainerOptions<S, R, I>,
): Store<S, R, D> {
  const [store] = useState(() => createContainer(def, opts));
  useEffect(() => () => store.destroy(), [store]);
  return store;
}

/**
 * Read a derived slice. Returns the value; reading it during render subscribes
 * the component fine-grainedly via @preact/signals (only re-renders when this
 * value changes). For zero-VDOM updates, render `store.$state.x` directly in JSX.
 */
export function useSelect<S, R, D extends Record<string, () => unknown>, T>(
  store: Store<S, R, D>,
  selector: (state: StateSignals<S>, derived: DerivedSignals<D>) => T,
): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const sig = useMemo(
    () => store.select((s, d) => selectorRef.current(s, d)),
    [store],
  );
  return sig.value;
}

/** Run an effect when a derived slice changes. */
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
