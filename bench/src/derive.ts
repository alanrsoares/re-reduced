/**
 * Derivation crossover probe.
 *
 * WHY: a memoized `derive` read is NOT free — it pays a fixed signal-graph
 * floor (~11ns: dependency-version check on a `computed`). Recompute-each-read
 * is O(work). So memoization only wins above a crossover point. The docs say
 * "reach for derive when non-trivial" qualitatively — this finds the number.
 *
 * Sweep the work size (reduce over W items). For each W we compare:
 *   - memoized cached read (input unchanged → returns cached, ~constant)
 *   - manual recompute each read (O(W))
 * The crossover W is where recompute time crosses the memo floor.
 *
 *   bun run src/derive.ts
 */
import { createContainer, defineContainer } from "@re-reduced/core";
import { bench, run, summary } from "mitata";

/** mitata's parameterized-bench state (its `k_state` type isn't exported). */
type BenchState = { get(name: string): unknown };

const WORK = [1, 4, 16, 64, 256, 1024];

let sink = 0;

summary(() => {
  bench(
    "re-reduced · memoized cached read · $w items",
    function* (state: BenchState) {
      const w = state.get("w") as number;
      const items = Array.from({ length: w }, (_, i) => i);
      const store = createContainer(
        defineContainer(`d${w}`, {
          state: { items },
          actions: (on) => ({ noop: on((s) => s) }),
          derive: ($) => ({
            sum: () => $.items.value.reduce((a, b) => a + b, 0),
          }),
        }),
      );
      store.$derived.sum.peek(); // warm the cache
      yield () => {
        sink += store.$derived.sum.peek();
      };
    },
  ).args("w", WORK);

  bench(
    "manual · recompute each read · $w items",
    function* (state: BenchState) {
      const w = state.get("w") as number;
      const items = Array.from({ length: w }, (_, i) => i);
      yield () => {
        sink += items.reduce((a, b) => a + b, 0);
      };
    },
  ).args("w", WORK);
});

await run();
if (sink === -1) console.log(sink);
