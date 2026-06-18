# re-reduced v2 — Implementation Plan

Signal-backed, functional, component-scoped state-machine + effect container. Multi-renderer (React + Preact first). Decisions are recorded in `docs/adr/0001`–`0008`; terms in `CONTEXT.md`. This doc is the build-out, not the rationale.

## Package layout (bun workspaces — ADR-0008)

```
packages/
  signals/        @re-reduced/signals       façade over the engine (default @preact/signals-core, swappable) — ADR-0001
  core/           @re-reduced/core           defineContainer, createContainer, derive, reactions, intent registry, core interpreters
  adapter-kit/    (private, unpublished)     shared selector→computed bridge, query/mutate interpreters, intent wiring — ADR-0007
  react/          @re-reduced/react          useContainer/useSelect (uSES+computed), useWatch, context
  preact/         @re-reduced/preact          native .raw JSX path + useStore + useSelect, context
  legacy/         re-reduced@2.x (frozen)     the existing v1 redux helper, untouched — ADR-0008
examples/         todo app per renderer
docs/             adr/, this plan, conceptual v1→v2 guide
```
Tooling mirrors styled-cva: bun workspaces, `--filter @re-reduced/*` fan-out, changesets with per-package `release:<pkg>`, root `check = lint && typecheck && test && build`. Each package: biome, TS 6, `peerDependencies.typescript >= 6`, `ts-expect` type tests + `tsc` gate, bun test. Build: tsdown/tsup ESM-first with `.d.ts`.

## Core model (ADR-0002 → 0006)

**Definition** (`defineContainer`) has three blocks:
- `state` — initial state object.
- `actions: (on) => ({...})` — pure transitions `(state, payload) => state` (ADR-0003). Errors are discriminated-union fields in state; dispatch returns `void`.
- `derive: (c) => ({...})` — auto-tracked `computed` derivations (ADR-0002).
- `effects: (fx) => ({...})` — reactions emitting intents on `fx.onAction` / `fx.onEnter` / `fx.onChange` (ADR-0005).

**Store** (`createContainer(def, init?)`):
- one signal per top-level state key; dispatch shallow-diffs and writes only changed keys (ADR-0002).
- `getState()` glitch-free snapshot; `subscribe(fn)` (Svelte-compatible); `actions` referentially stable; `destroy()` cancels timers / aborts intent `AbortSignal`s / stops effects.
- `init` shallow-merged at construction, **not reactive** (reset is explicit via an action).

**Intents** (ADR-0004, 0006): tagged unions; open `kind → interpreter` registry with compile-time key coverage. Interpreter sig `(intent, { dispatch, signal }) => void | (() => void)`. Core ships `timeout`/`interval`/`storage`; adapters ship `query`/`mutate`. SSOT rule: intents trigger I/O and dispatch results back as actions; they do **not** mirror the query cache for pure rendering.

## Renderer adapters (ADR-0007)

- **React**: `useContainer` (lazy-init once), `useSelect(store, sel)` = `useSyncExternalStore` over a `computed` of the selector (auto-tracks read signals, equality bail-out), `useWatch`, `createContainerContext`. `query`/`mutate` interpreters bridge to TanStack Query.
- **Preact**: same surface, plus the native fast path — expose `.raw` signal for zero-hook JSX auto-subscription (VDOM-bypass) when on the default engine; `useStore` hook for non-signal reads.
- Shared `query`/`mutate`/selector/intent logic lives in private `adapter-kit`.

## SSR / RSC

Container is a `"use client"` boundary. SSR initial render reads `getState()`; because `init` is construction-only there is no hydration re-init mismatch.

## Milestones (ordered by risk — types are proven; perf is the open risk)

- **M0 — done.** Type spike: union-registry action/reducer inference with zero `any` (`spike/v2-core`).
- **M1 — critical spike.** `@re-reduced/signals` façade + `createContainer` (per-field signals, shallow-diff dispatch, `computed` derive) + React `useSelect`. Render-count harness proving a `draft` keystroke re-renders only the input subtree, not the list. `ts-expect` for `$state`/`$derived`/selector inference. **Validates the perf thesis.**
- **M2 — effects.** Reactions block + intent registry + core interpreters (`timeout`/`storage`) + `adapter-kit` `query`/`mutate` against a mocked query hook. Prove intent→useQuery bridge and the SSOT discipline.
- **M3 — Preact.** `@re-reduced/preact` native `.raw` JSX path; render-count harness showing zero VDOM update on signal change. Reuse `adapter-kit`.
- **M4 — context + lifecycle.** `createContainerContext` on both adapters; dispose/abort wiring; stable identities.
- **M5 — monorepo + ship.** Restructure repo to workspaces; move v1 → `packages/legacy` (frozen `re-reduced@2`); changesets/release; docs; TODO example in React + Preact; conceptual v1→v2 guide.
- **M6 — 1.0.** API freeze; perf benchmarks vs Zustand / `useReducer`; optional `@re-reduced/{eslint,biome}-plugin`.

## v1.0 scope

`@re-reduced/{signals,core,react,preact}` (+ private `adapter-kit`), the four built-in intent kinds, local + lifted Stores, TODO example on both renderers, docs. Solid/Vue/Svelte adapters and the lint plugins are post-1.0.
