import { describe, expect, it } from "bun:test";
import { createContainer, defineContainer } from "../src/container";

const make = () =>
  createContainer(
    defineContainer("t", {
      state: { a: 0, b: 99, c: "x" },
      actions: (on) => ({
        // partial return — no spread; omitted keys must be retained
        bumpA: on((s) => ({ a: s.a + 1 })),
        setB: on<number>((_s, b) => ({ b })),
        // full-replace style (spread) must still work
        full: on((s) => ({ ...s, a: s.a + 10 })),
      }),
    }),
  );

describe("@re-reduced/core — state mirror + partial returns", () => {
  it("merges partial returns, retaining omitted keys", () => {
    const store = make();
    store.actions.bumpA();
    expect(store.getState()).toEqual({ a: 1, b: 99, c: "x" });
    store.actions.setB(7);
    expect(store.getState()).toEqual({ a: 1, b: 7, c: "x" });
  });

  it("keeps the mirror in sync across a sequence of dispatches", () => {
    const store = make();
    store.actions.bumpA();
    store.actions.bumpA();
    store.actions.full(); // a += 10 via spread
    store.actions.setB(3);
    expect(store.getState()).toEqual({ a: 12, b: 3, c: "x" });
    // signals and the snapshot agree
    expect(store.$state.a.peek()).toBe(12);
    expect(store.$state.b.peek()).toBe(3);
  });

  it("getState() returns a clone — mutating it can't corrupt the store", () => {
    const store = make();
    const snap = store.getState();
    (snap as { a: number }).a = 999;
    expect(store.getState().a).toBe(0);
    expect(store.$state.a.peek()).toBe(0);
  });

  it("only writes signals for keys that actually changed", () => {
    const store = make();
    let bWrites = 0;
    store.$state.b.subscribe(() => {
      bWrites += 1;
    });
    bWrites = 0; // ignore the immediate subscribe call
    store.actions.bumpA(); // touches a, not b
    expect(bWrites).toBe(0);
  });
});
