/**
 * @re-reduced/core — the container.
 *
 * - per-field signals + shallow-diff dispatch (ADR-0002)
 * - pure transitions (state, payload) => state (ADR-0003)
 * - auto-tracked computed derivations (ADR-0002)
 * - reactions block emitting effect intents (ADR-0004/0005)
 * - intent dispatcher routing by kind to registered interpreters (ADR-0006)
 *
 * Action-registry inference uses method bivariance so a
 * `Record<string, ActionSpec<S, unknown>>` constraint accepts concrete payload
 * types with zero `any` (the v1 wall).
 */
import {
  batch,
  computed,
  effect,
  type ReadSignal,
  signal,
  type WriteSignal,
} from "@re-reduced/signals";

// ── action registry ──
/** Handler stored as a METHOD → bivariant params → satisfies the unknown-constraint. */
export interface ActionSpec<S, P> {
  reduce(state: S, payload: P): S;
}
export type OnBuilder<S> = <P = void>(
  reduce: (state: S, payload: P) => S,
) => ActionSpec<S, P>;

type PayloadOf<Sp> = Sp extends ActionSpec<any, infer P> ? P : never;
/** void OR unknown payload (handler ignores payload) → nullary creator. */
type IsVoid<P> = [P] extends [void] ? true : unknown extends P ? true : false;
type Args<P> = IsVoid<P> extends true ? [] : [payload: P];

export type Actions<R> = {
  [K in keyof R & string]: (...args: Args<PayloadOf<R[K]>>) => void;
};
export type StateSignals<S> = { readonly [K in keyof S]: ReadSignal<S[K]> };
export type DerivedSignals<D> = {
  readonly [K in keyof D]: D[K] extends () => infer T ? ReadSignal<T> : never;
};

// ── intents / interpreters (ADR-0006) ──
export interface InterpCtx<A> {
  readonly actions: A;
  readonly signal: AbortSignal;
}
export type Interpreter<I, A> = (
  intent: I,
  ctx: InterpCtx<A>,
) => void | (() => void);
/** Typed coverage: a registry MUST supply an interpreter for every intent kind. */
export type Interpreters<I extends { kind: string }, A> = {
  [K in I["kind"]]: Interpreter<Extract<I, { kind: K }>, A>;
};

// ── reactions (ADR-0005) ──
export interface ReactionCtx<S, A> {
  getState(): S;
  readonly actions: A;
}
type Emit<I> = I | I[] | void;

/**
 * A reaction descriptor returned by the `effects` builder. It carries its
 * emitted intent type `I` (via a phantom) so `defineContainer` can infer the
 * container's intent union from the returned reactions — no explicit type
 * argument needed.
 */
export type Reaction<S, A, I> = { readonly __intent?: I } & (
  | {
      readonly kind: "action";
      readonly name: string;
      readonly run: (payload: unknown, ctx: ReactionCtx<S, A>) => Emit<I>;
    }
  | {
      readonly kind: "change";
      readonly select: (s: StateSignals<S>) => unknown;
      readonly run: (
        value: unknown,
        prev: unknown,
        ctx: ReactionCtx<S, A>,
      ) => Emit<I>;
    }
  | {
      readonly kind: "enter";
      readonly predicate: (s: StateSignals<S>) => boolean;
      readonly run: (ctx: ReactionCtx<S, A>) => Emit<I>;
    }
);
export type AnyReaction<S, A> = Reaction<S, A, unknown>;

export interface EffectBuilder<S, ActionName extends string, A> {
  onAction<I = never>(
    name: ActionName,
    handler: (payload: unknown, ctx: ReactionCtx<S, A>) => Emit<I>,
  ): Reaction<S, A, I>;
  onChange<T, I = never>(
    select: (s: StateSignals<S>) => T,
    handler: (value: T, prev: T, ctx: ReactionCtx<S, A>) => Emit<I>,
  ): Reaction<S, A, I>;
  /** Fires when `predicate` transitions into true (and once at mount if already true). */
  onEnter<I = never>(
    predicate: (s: StateSignals<S>) => boolean,
    handler: (ctx: ReactionCtx<S, A>) => Emit<I>,
  ): Reaction<S, A, I>;
}

/** The intent union emitted by a tuple of reactions (`never` when there are none). */
export type IntentOf<RS> = RS extends readonly []
  ? never
  : RS extends ReadonlyArray<{ __intent?: infer I }>
    ? [unknown] extends [I]
      ? never
      : I
    : never;

export interface ContainerDef<
  S,
  R,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
> {
  state: S;
  actions: (on: OnBuilder<S>) => R;
  derive?: (state: StateSignals<S>) => D;
  effects?: (
    fx: EffectBuilder<S, keyof R & string, Actions<R>>,
  ) => ReadonlyArray<Reaction<S, Actions<R>, I>>;
  readonly __intent?: I;
}

export interface Store<S, R, D extends Record<string, () => unknown>> {
  readonly $state: StateSignals<S>;
  readonly $derived: DerivedSignals<D>;
  readonly actions: Actions<R>;
  /** True once destroy() has run. Adapters use this to recover under StrictMode. */
  readonly destroyed: boolean;
  getState(): S;
  select<T>(
    sel: (s: StateSignals<S>, d: DerivedSignals<D>) => T,
  ): ReadSignal<T>;
  destroy(): void;
}

/**
 * Single call — `S`/`R`/`D` are inferred from the body, and the intent union
 * is inferred from the reactions the `effects` block returns:
 *
 *   defineContainer("name", { state, actions, derive, effects: (fx) => [ ... ] })
 */
export function defineContainer<
  S extends Record<string, unknown>,
  R extends Record<string, ActionSpec<S, unknown>>,
  D extends Record<string, () => unknown> = Record<string, never>,
  RS extends ReadonlyArray<AnyReaction<S, Actions<R>>> = readonly [],
>(
  name: string,
  def: {
    state: S;
    actions: (on: OnBuilder<S>) => R;
    derive?: (state: StateSignals<S>) => D;
    effects?: (fx: EffectBuilder<S, keyof R & string, Actions<R>>) => RS;
  },
): ContainerDef<S, R, D, IntentOf<RS>> & { name: string } {
  return { name, ...def } as ContainerDef<S, R, D, IntentOf<RS>> & {
    name: string;
  };
}

export function createContainer<
  S extends Record<string, unknown>,
  R extends Record<string, ActionSpec<S, unknown>>,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
>(
  def: ContainerDef<S, R, D, I>,
  opts?: { interpreters?: Interpreters<I, Actions<R>>; init?: Partial<S> },
): Store<S, R, D> {
  const initial = { ...def.state, ...opts?.init };
  const controller = new AbortController();
  const cleanups: Array<() => void> = [];

  const $state = {} as Record<string, WriteSignal<unknown>>;
  for (const key of Object.keys(initial)) $state[key] = signal(initial[key]);

  const snapshot = (): S => {
    const out = {} as Record<string, unknown>;
    for (const key of Object.keys($state)) out[key] = $state[key].peek();
    return out as S;
  };

  const interpreters = (opts?.interpreters ?? {}) as unknown as Record<
    string,
    Interpreter<I, Actions<R>>
  >;
  const runIntent = (intent: I) => {
    const interpret = interpreters[intent.kind];
    if (!interpret)
      throw new Error(`no interpreter for intent kind "${intent.kind}"`);
    const cleanup = interpret(intent, {
      actions: api.actions,
      signal: controller.signal,
    });
    if (cleanup) cleanups.push(cleanup);
  };
  const dispatchIntents = (result: Emit<I>) => {
    if (!result) return;
    for (const i of Array.isArray(result) ? result : [result]) runIntent(i);
  };

  const actionListeners = new Set<(name: string, payload: unknown) => void>();
  const specs = def.actions(((reduce) => ({ reduce })) as OnBuilder<S>);
  const actions = {} as Record<string, (payload?: unknown) => void>;
  for (const key of Object.keys(specs)) {
    actions[key] = (payload?: unknown) => {
      const prev = snapshot();
      const next = specs[key].reduce(prev, payload) as Record<string, unknown>;
      batch(() => {
        for (const k of Object.keys(next)) {
          if (!Object.is(next[k], (prev as Record<string, unknown>)[k]))
            $state[k].value = next[k];
        }
      });
      for (const fn of actionListeners) fn(key, payload); // committed → notify (ADR-0005)
    };
  }

  const $derived = {} as Record<string, ReadSignal<unknown>>;
  if (def.derive) {
    const builders = def.derive($state as StateSignals<S>);
    for (const key of Object.keys(builders))
      $derived[key] = computed(builders[key]);
  }

  let destroyed = false;
  const api: Store<S, R, D> = {
    $state: $state as StateSignals<S>,
    $derived: $derived as DerivedSignals<D>,
    actions: actions as unknown as Actions<R>,
    get destroyed() {
      return destroyed;
    },
    getState: snapshot,
    select: (sel) =>
      computed(() =>
        sel($state as StateSignals<S>, $derived as DerivedSignals<D>),
      ),
    destroy: () => {
      if (destroyed) return; // idempotent
      destroyed = true;
      controller.abort();
      for (const fn of cleanups.splice(0)) fn();
      actionListeners.clear();
    },
  };

  if (def.effects) {
    const ctx: ReactionCtx<S, Actions<R>> = {
      getState: snapshot,
      actions: api.actions,
    };
    // The builder just constructs descriptors; createContainer wires them.
    const fx = {
      onAction: (name: string, run: unknown) => ({ kind: "action", name, run }),
      onChange: (select: unknown, run: unknown) => ({
        kind: "change",
        select,
        run,
      }),
      onEnter: (predicate: unknown, run: unknown) => ({
        kind: "enter",
        predicate,
        run,
      }),
    } as unknown as EffectBuilder<S, keyof R & string, Actions<R>>;

    const reactions = def.effects(fx) as ReadonlyArray<
      Reaction<S, Actions<R>, I>
    >;
    for (const reaction of reactions) {
      if (reaction.kind === "action") {
        const { name, run } = reaction;
        const listener = (firedName: string, payload: unknown) => {
          if (firedName === name) dispatchIntents(run(payload, ctx));
        };
        actionListeners.add(listener);
        cleanups.push(() => actionListeners.delete(listener));
      } else if (reaction.kind === "change") {
        const { select, run } = reaction;
        let prev: unknown;
        let first = true;
        cleanups.push(
          effect(() => {
            const value = select($state as StateSignals<S>);
            if (first) {
              first = false;
              prev = value;
              return;
            }
            if (!Object.is(value, prev)) {
              const before = prev;
              prev = value;
              dispatchIntents(run(value, before, ctx));
            }
          }),
        );
      } else {
        const { predicate, run } = reaction;
        let was = false;
        cleanups.push(
          effect(() => {
            const now = predicate($state as StateSignals<S>);
            if (now && !was) dispatchIntents(run(ctx));
            was = now;
          }),
        );
      }
    }
  }

  return api;
}
