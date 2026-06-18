# Effects modeled as declared intents, interpreted by adapters

Side-effects are first-class in the Container Definition as **Effect Intents** — pure, serializable descriptors emitted in response to transitions or state changes. The Store does not execute them; **Adapters supply interpreters** that do. Server I/O routes through a query interpreter that bridges to the host's data layer (TanStack Query etc.).

## Context

The library is framed as a "state machine + effect intent" container, and targets multiple renderers. Intents-as-data are more portable than renderer-specific effect hooks: every adapter interprets the same intent vocabulary, and the pure container stays unit-testable without a renderer.

## Single-source-of-truth discipline

Intents trigger I/O and feed results back **as actions**. They do **not** mirror the query cache into container state for pure rendering — lists and server data are read from the host's query library directly. Effect intents exist for fire-and-forget side-effects (storage, analytics) and transition-gating fetches, not for duplicating server state.

## Consequences

- Core grows a small intent dispatcher and an interpreter contract; adapters must ship at least a default interpreter.
- Larger surface than adapter-hooks-only, traded for portability and testability.
- Emission mechanism preserves ADR-0003 (transitions stay `(state, payload) => state`): intents are declared in a separate reactions block, not returned from reducers (see ADR-0005).
