---
name: re-reduced
description: Build component-scoped state with @re-reduced/react or @re-reduced/preact — define containers (state/actions/derive/effects), bind with useContainer/useSelect, wire effect intents to a data layer, and test. Use when you see defineContainer, useContainer, useSelect, effect intents, or any @re-reduced/* import.
---

# re-reduced

A typed, signal-backed, component-scoped state-machine + effect container for
React and Preact. The container owns transitions and effect *intent*; server
state stays in the host data layer (TanStack Query) via interpreters.

## Define a container (single call — no type args)

```ts
import { defineContainer } from "@re-reduced/react"; // or @re-reduced/preact

const todos = defineContainer("todos", {
  state: { draft: "", items: [] as Todo[], error: null as string | null },
  actions: (on) => ({
    draftChanged: on<string>((s, draft) => ({ ...s, draft, error: null })),
    // fallible transitions write an error field — never throw, never return Result
    submit: on((s) =>
      s.draft.trim() === ""
        ? { ...s, error: "empty" }
        : { ...s, items: [{ title: s.draft }, ...s.items], draft: "" }),
  }),
  derive: ($) => ({
    visible: () => $.items.value.filter((t) => !t.done),
    canSubmit: () => $.draft.value.trim().length > 0,
  }),
  // effects RETURN reactions (an array) — the intent union is inferred from them
  effects: (fx) => [
    fx.onAction("load", (_p, { actions }) =>
      query<Todo[]>({ key: ["todos"], run: () => api.list(), onData: (x) => actions.loaded(x) })),
  ],
});
```

Rules:
- `actions` are pure `(state, payload) => state`. The `on` builder captures the
  payload type; a handler that ignores the payload is nullary.
- Fallible transitions put a discriminated-union error in state; dispatch is
  `void`. Validity is a derivation (`canSubmit`) read before dispatching.
- `derive` is auto-tracked and memoized (recomputes only when read signals change).
- `effects` returns reactions from `fx.onAction` / `fx.onChange` / `fx.onEnter`.

## Use in a component

```tsx
import { useContainer, useSelect } from "@re-reduced/react";

const store = useContainer(todos, { interpreters: { query: makeQueryInterpreter(queryClient) } });
const draft = useSelect(store, (s) => s.draft.value);
const visible = useSelect(store, (_s, d) => d.visible.value);
store.actions.draftChanged("x");
```

**Critical gotcha (TypeScript won't catch it):** a `useSelect` selector must
return a **primitive or a stable reference**. Returning a fresh object/array
literal — `useSelect(store, (s) => ({ a: s.a.value, b: s.b.value }))` — makes a
new reference every call, defeating the bail-out so the component re-renders on
every update. Read one value per `useSelect`, or split into several.

## Server state

Keep server data in `useQuery`/`useMutation`; the container holds UI/transition
state only. Use the `query`/`mutate` effect intents (interpreted by
`@re-reduced/adapter-kit`, bound to your QueryClient) only when fetched data
gates a transition. Intents trigger I/O and feed results back **as actions** —
they don't mirror the cache.

## Lift to a subtree

```ts
const Ctx = createContainerContext(todos);
// <Ctx.Provider init={{ draft: "x" }}>… const store = Ctx.use()
```

## Test (no renderer needed)

```ts
const store = createContainer(todos, { init: { draft: "hi" } });
store.actions.submit();
expect(store.getState().items).toHaveLength(1);
expect(store.$derived.canSubmit.peek()).toBe(true);
```

Assert effect intents with stub interpreters; assert inference with `ts-expect`;
assert renders with `@testing-library/{react,preact}` + happy-dom.

## Preact

Same API from `@re-reduced/preact`; reading a selector value subscribes the
component via `@preact/signals`, and `store.$state.x` can render directly in JSX
for zero-VDOM updates. The container definition is identical across renderers.
