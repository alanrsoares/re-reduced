// The "use it in a component" example as a real, type-checked .tsx module
// (enabled by @onrails/twoslash >= 0.1.3 scanning .tsx). The container is hidden
// behind the cut so the rendered snippet reads as it would in your app — the
// definition is shown one step earlier in the docs.

// #region snippet
import { defineContainer, useContainer, useSelect } from "@re-reduced/react";

// ---cut-start---
const counter = defineContainer("counter", {
  state: { count: 0 },
  actions: (on) => ({
    add: on<number>((s, n) => ({ count: s.count + n })),
    reset: on(() => ({ count: 0 })),
  }),
  derive: ($) => ({ isEven: () => $.count.value % 2 === 0 }),
});
// ---cut-end---
export function Counter() {
  const store = useContainer(counter);
  const count = useSelect(store, (s) => s.count.value);
  const isEven = useSelect(store, (_s, d) => d.isEven.value);

  return (
    <div>
      <span>
        {count} {isEven ? "(even)" : "(odd)"}
      </span>
      <button type="button" onClick={() => store.actions.add(1)}>
        +1
      </button>
      <button type="button" onClick={store.actions.reset}>
        reset
      </button>
    </div>
  );
}
// #endregion
