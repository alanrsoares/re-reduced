/**
 * Field-count scaling probe.
 *
 * WHY: re-reduced's dispatch path (container.ts) calls `snapshot()` on every
 * action — it peeks EVERY field and builds a fresh object — then the reducer
 * allocs a next state, then `batch()` diffs all keys. So dispatch cost and
 * allocation should grow O(fields), even for a single-field bump. Zustand holds
 * one state object and should stay ~flat.
 *
 * This bench sweeps field count so the O(N) snapshot cost (and the heap column)
 * becomes visible. If rr scales linearly and zustand stays flat, the snapshot is
 * the lever: lazy/partial state arg, or skip the rebuild for field-local writes.
 *
 *   bun run src/scaling.ts
 */
import { createContainer, defineContainer } from "@re-reduced/core";
import { bench, run, summary } from "mitata";
import { createStore } from "zustand/vanilla";

/** mitata's parameterized-bench state (its `k_state` type isn't exported). */
type BenchState = { get(name: string): unknown };

const FIELDS = [1, 4, 16, 64];

// Build a container/store with `n` numeric fields; bump only the first.
const mkState = (n: number): Record<string, number> =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`f${i}`, 0]));

let sink = 0;

summary(() => {
  bench(
    "re-reduced · single-field bump · $n fields",
    function* (state: BenchState) {
      const n = state.get("n") as number;
      const store = createContainer(
        defineContainer(`c${n}`, {
          state: mkState(n),
          actions: (on) => ({ inc: on((s) => ({ ...s, f0: s.f0 + 1 })) }),
        }),
      );
      yield () => {
        store.actions.inc();
        sink += store.$state.f0.peek();
      };
    },
  ).args("n", FIELDS);

  bench(
    "zustand · single-field bump · $n fields",
    function* (state: BenchState) {
      const n = state.get("n") as number;
      const store = createStore<Record<string, number>>(() => mkState(n));
      yield () => {
        store.setState((s) => ({ f0: s.f0 + 1 }));
        sink += store.getState().f0;
      };
    },
  ).args("n", FIELDS);
});

await run();
if (sink === -1) console.log(sink);
