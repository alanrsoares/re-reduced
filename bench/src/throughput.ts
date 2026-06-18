import { createContainer, defineContainer } from "@re-reduced/core";
import { bench, run, summary } from "mitata";
import { createStore } from "zustand/vanilla";

// ── re-reduced ──
const rr = createContainer(
  defineContainer("c", {
    state: { count: 0 },
    actions: (on) => ({ inc: on((s) => ({ count: s.count + 1 })) }),
  }),
);

// expensive derivation read repeatedly while its input is unchanged — the
// scenario memoization targets (a big filter/reduce, not `count * 2`).
const ITEMS = Array.from({ length: 1000 }, (_, i) => i);
const bigSum = createContainer(
  defineContainer("big", {
    state: { items: ITEMS },
    actions: (on) => ({ noop: on((s) => s) }),
    derive: ($) => ({ sum: () => $.items.value.reduce((a, b) => a + b, 0) }),
  }),
);

// ── zustand (vanilla) ──
const zs = createStore<{ count: number; inc: () => void }>((set) => ({
  count: 0,
  inc: () => set((s) => ({ count: s.count + 1 })),
}));

// ── plain reducer ──
type S = { count: number };
const reducer = (s: S, a: { type: "inc" }) =>
  a.type === "inc" ? { count: s.count + 1 } : s;
let plain: S = { count: 0 };

let sink = 0;

summary(() => {
  bench("re-reduced  · dispatch + read", () => {
    rr.actions.inc();
    sink += rr.$state.count.peek();
  });
  bench("zustand     · dispatch + read", () => {
    zs.getState().inc();
    sink += zs.getState().count;
  });
  bench("plain reducer · dispatch + read", () => {
    plain = reducer(plain, { type: "inc" });
    sink += plain.count;
  });
});

summary(() => {
  bench("re-reduced · expensive derived, memoized read", () => {
    sink += bigSum.$derived.sum.peek();
  });
  bench("manual     · expensive derived, recompute each read", () => {
    sink += ITEMS.reduce((a, b) => a + b, 0);
  });
});

await run();
if (sink === -1) console.log(sink); // guard against dead-code elimination
