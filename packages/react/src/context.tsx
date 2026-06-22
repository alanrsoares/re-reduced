import type {
  ActionSpec,
  Actions,
  ContainerDef,
  DerivedSignals,
  StateSignals,
  Store,
} from "@re-reduced/core";
import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import {
  type DerivedValues,
  type UseContainerOptions,
  useContainer,
  useSelect,
  useStoreValues,
} from "./hooks";

/**
 * Lift a Container to a subtree. Reads still go through signals, so selector
 * bail-out is preserved — unlike raw Context value broadcast.
 *
 * The returned object carries context-bound hooks so consumers never thread the
 * store: `Counter.useContainer()` destructures values + actions (unstated-next
 * style), `Counter.useSelect(sel)` reads one slice, `Counter.useActions()` the
 * action map. `Counter.use()` still returns the raw Store for escape hatches.
 */
export function createContainerContext<
  S extends Record<string, unknown>,
  R extends Record<string, ActionSpec<S, unknown>>,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
>(def: ContainerDef<S, R, D, I>, baseOpts?: UseContainerOptions<S, R, I>) {
  const Ctx = createContext<Store<S, R, D> | null>(null);

  function Provider(props: { children: ReactNode; init?: Partial<S> }) {
    const store = useContainer(def, {
      ...baseOpts,
      init: props.init ?? baseOpts?.init,
    });
    return createElement(Ctx.Provider, { value: store }, props.children);
  }

  function useStore(): Store<S, R, D> {
    const store = useContext(Ctx);
    if (!store)
      throw new Error(
        `Container "${(def as { name?: string }).name ?? "?"}" has no Provider above`,
      );
    return store;
  }

  /** One slice, primitive/stable ref — preserves bail-out. */
  function useCtxSelect<T>(
    selector: (state: StateSignals<S>, derived: DerivedSignals<D>) => T,
  ): T {
    return useSelect(useStore(), selector);
  }

  /** The action map (stable callbacks). */
  function useActions(): Actions<R> {
    return useStore().actions;
  }

  /**
   * Destructure values AND actions in one go (unstated-next ergonomics):
   * `const { count, increment } = Counter.useContainer()`. Each value key
   * tracked per-field; action keys win on a name clash. Destructure — don't
   * spread.
   */
  function useContainerValues(): S & DerivedValues<D> & Actions<R> {
    const store = useStore();
    const values = useStoreValues(store);
    return useMemo(
      () =>
        new Proxy({} as S & DerivedValues<D> & Actions<R>, {
          get(_t, key) {
            if (typeof key !== "string") return undefined;
            if (key in (store.actions as object))
              return (store.actions as Record<string, unknown>)[key];
            return (values as Record<string, unknown>)[key];
          },
        }),
      [store, values],
    );
  }

  return {
    Provider,
    use: useStore,
    useContainer: useContainerValues,
    useSelect: useCtxSelect,
    useActions,
    Context: Ctx,
  };
}
