import { describe, expect, it } from "bun:test";
import { expectType, type TypeEqual } from "ts-expect";

import { createAction, createActions, createAsyncAction } from "../src/actions";
import type { Action, ActionCreator, AsyncActionCreator } from "../src/core";

/**
 * Compile-time inference tests for the action-creator API.
 *
 * `expectType` is a no-op at runtime — these assertions are enforced by the
 * `typecheck` script (`tsc -p tsconfig.test.json`). They lock in the current
 * inference so the gradual `any` -> `unknown` migration can't silently regress
 * payload/meta inference.
 */
describe("actions inference", () => {
  it("createAction captures the payload type", () => {
    const sayHello = createAction<string>("SAY_HELLO");
    expectType<TypeEqual<typeof sayHello, ActionCreator<string>>>(true);

    const action = sayHello("world");
    expectType<TypeEqual<typeof action, Action<string>>>(true);
    expectType<TypeEqual<typeof action.payload, string>>(true);
    expectType<string>(action.type);

    expect(true).toBe(true);
  });

  it("createAction captures the meta type", () => {
    const withMeta = createAction<number, boolean>("WITH_META");
    expectType<TypeEqual<typeof withMeta, ActionCreator<number, boolean>>>(
      true,
    );

    withMeta(1, { meta: true });
    // @ts-expect-error meta must be a boolean
    withMeta(1, { meta: "not-a-boolean" });

    expect(true).toBe(true);
  });

  it("createAsyncAction infers result, payload and error types", () => {
    interface Movie {
      id: string;
      title: string;
    }

    const fetchMovies = createAsyncAction<Movie[]>("FETCH", "MOVIES");
    expectType<
      TypeEqual<typeof fetchMovies, AsyncActionCreator<Movie[], void, Error>>
    >(true);

    const success = fetchMovies.success([]);
    expectType<TypeEqual<typeof success.payload, Movie[]>>(true);

    const failure = fetchMovies.failure(new Error("boom"));
    expectType<TypeEqual<typeof failure.payload, Error>>(true);

    expect(true).toBe(true);
  });

  it("createActions infers the shape of the generated map", () => {
    const actions = createActions((create) => ({
      increment: create.action(),
      setName: create.action<string>(),
      fetchUser: create.asyncAction<{ id: number }>(),
    }));

    expectType<
      TypeEqual<typeof actions.increment, ActionCreator<void, unknown>>
    >(true);
    expectType<
      TypeEqual<typeof actions.setName, ActionCreator<string, unknown>>
    >(true);
    expectType<
      TypeEqual<
        typeof actions.fetchUser,
        AsyncActionCreator<{ id: number }, void, Error>
      >
    >(true);

    expect(true).toBe(true);
  });

  it("reduce infers state and payload in the handler", () => {
    interface CounterState {
      count: number;
    }

    const setCount = createAction<number>("SET_COUNT");

    setCount.reduce<CounterState>((state, payload) => {
      expectType<TypeEqual<typeof state, CounterState>>(true);
      expectType<TypeEqual<typeof payload, number>>(true);
      return { count: payload };
    });

    expect(true).toBe(true);
  });
});
