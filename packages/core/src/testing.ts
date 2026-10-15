/**
 * Test helper. `createContainer` throws when an intent kind has no
 * interpreter, so a test would have to stub every kind. `createTestStore`
 * stubs all kinds and records the emitted intents instead.
 */
import {
  type ActionSpec,
  type Actions,
  type ContainerDef,
  createContainer,
  type InterpCtx,
  type Interpreter,
  type Interpreters,
  type Store,
} from "./container";

export interface TestStore<
  S,
  R,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
> extends Store<S, R, D> {
  /** Every intent emitted so far, in order. */
  readonly intents: readonly I[];
  /** Forget the recorded intents. */
  clearIntents(): void;
}

export function createTestStore<
  S extends Record<string, unknown>,
  R extends Record<string, ActionSpec<S, unknown>>,
  D extends Record<string, () => unknown>,
  I extends { kind: string },
>(
  def: ContainerDef<S, R, D, I>,
  opts?: {
    init?: Partial<S>;
    /** Real interpreters for chosen kinds. Other kinds are only recorded. */
    interpreters?: Partial<Interpreters<I, Actions<R>>>;
  },
): TestStore<S, R, D, I> {
  const intents: I[] = [];
  const real = (opts?.interpreters ?? {}) as Record<
    string,
    Interpreter<I, Actions<R>> | undefined
  >;
  // The container looks interpreters up by kind, so a Proxy answers for any kind.
  const interpreters = new Proxy(
    {} as Record<string, Interpreter<I, Actions<R>>>,
    {
      get: (_t, kind) => (intent: I, ctx: InterpCtx<Actions<R>>) => {
        intents.push(intent);
        return real[kind as string]?.(intent, ctx);
      },
    },
  );
  const store = createContainer(def, {
    init: opts?.init,
    interpreters: interpreters as unknown as Interpreters<I, Actions<R>>,
  });
  return Object.assign(store, {
    intents,
    clearIntents: () => {
      intents.length = 0;
    },
  });
}
