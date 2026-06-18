# Separate React and Preact adapters over a shared adapter-kit

`@re-reduced/react` and `@re-reduced/preact` are distinct packages sharing a private internal `adapter-kit` (selector→computed bridge, query/mutate interpreters, intent wiring). React binds via `useSyncExternalStore` + a `computed` selector; Preact renders the underlying native signal (`.raw`) directly in JSX for VDOM-bypass, with a `useStore` hook for non-signal reads.

## Context

styled-cva ships one React package and supports Preact via the `preact/compat` alias. That does not work here: the reason for targeting Preact is native signals-in-JSX VDOM-bypass (ADR-0001), and `preact/compat` makes Preact imitate React — which would force React-style hook binding and forfeit the advantage.

## Consequences

- A third internal module (`adapter-kit`) to factor and maintain; the two adapters must stay in sync, mitigated by the shared kit and shared type tests.
- Establishes the multi-framework template: future Solid/Vue adapters are thin packages over the same kit.
