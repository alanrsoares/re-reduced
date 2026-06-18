![re-reduced](/assets/logo.png)

A typed, functional, **signal-backed** state-machine + effect container for
component-scoped logic in React and Preact. It owns your state transitions and
effect _intent_ — and delegates server state to your data layer (TanStack Query,
etc.) through adapters.

> **v2 is a ground-up rewrite** under the `@re-reduced/*` scope. The original
> Redux/redux-saga helper (v1) is frozen and still published as `re-reduced@2`.

## Why

- **Signal-backed, fine-grained.** State lives in per-field signals; a component
  re-renders only when the slice it reads changes — no selector discipline.
- **Typed to the bone.** Action payloads, derivations, and effect interpreters
  are fully inferred, with zero `any` in your app code.
- **Effects as data.** Side-effects are declared as intents and interpreted by
  the renderer adapter, so the core stays pure and unit-testable.
- **Multi-renderer.** The same container definition runs under React and Preact.

## Install

```bash
# React
bun add @re-reduced/react @preact/signals-core
# Preact
bun add @re-reduced/preact @preact/signals-core @preact/signals
```

## Quick look

```tsx
import { defineContainer, useContainer, useSelect } from "@re-reduced/react";

const counter = defineContainer("counter", {
  state: { count: 0 },
  actions: (on) => ({
    increment: on((s) => ({ count: s.count + 1 })),
    add: on<number>((s, n) => ({ count: s.count + n })),
  }),
  derive: ($) => ({ isEven: () => $.count.value % 2 === 0 }),
});

function Counter() {
  const store = useContainer(counter);
  const count = useSelect(store, (s) => s.count.value);
  return <button type="button" onClick={() => store.actions.add(1)}>{count}</button>;
}
```

→ Full docs: **<https://alanrsoares.github.io/re-reduced/>** ·
run locally with `bun run --filter @re-reduced/docs dev`.

## Packages

| Package | Description |
| --- | --- |
| `@re-reduced/core` | Framework-agnostic container: state, actions, derivations, effect intents |
| `@re-reduced/signals` | Swappable signal-engine façade (default `@preact/signals-core`) |
| `@re-reduced/react` | React bindings — `useContainer` / `useSelect` / `useWatch` / context |
| `@re-reduced/preact` | Preact bindings (native signal rendering) |
| `@re-reduced/adapter-kit` | Renderer-agnostic `query` / `mutate` effect interpreters |
| `re-reduced` | **Frozen v1** (Redux/redux-saga helper) |

## Examples

- [`examples/react-todo`](./examples/react-todo) — React TODO
- [`examples/preact-todo`](./examples/preact-todo) — Preact TODO (same container)

## Develop

This is a Bun-workspaces monorepo.

```bash
bun install
bun run check   # lint + typecheck + test
bun run build   # build the publishable packages
```

## License

MIT
