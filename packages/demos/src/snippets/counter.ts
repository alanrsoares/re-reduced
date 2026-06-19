// The landing-page hero snippet. Lives here as a real module so the demos
// typecheck compiles it — the rendered hero can never drift from a counter that
// actually builds. JSX-free on purpose: the extractor only scans `.ts`, and the
// type story (inferred actions + derivations + selected slice) needs no markup.

// #region snippet
import { defineContainer, useContainer, useSelect } from "@re-reduced/react";

const counter = defineContainer("counter", {
  state: { count: 0 },
  actions: (on) => ({
    increment: on((s) => ({ count: s.count + 1 })),
    add: on<number>((s, n) => ({ count: s.count + n })),
  }),
  derive: ($) => ({ isEven: () => $.count.value % 2 === 0 }),
});

// in a component — re-renders only when the slice it reads changes
export function useCounter() {
  const store = useContainer(counter);
  const count = useSelect(store, (s) => s.count.value);
  const isEven = useSelect(store, (_s, d) => d.isEven.value);
  return { count, isEven, add: store.actions.add };
}
// #endregion
