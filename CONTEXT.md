# re-reduced

A typed, functional, signal-backed state-machine + side-effect container for **component-scoped** logic. Local-first, liftable to framework context, multi-renderer. It owns state transitions and effect *intent*; it delegates server-state execution to the host's data layer.

## Language

**Container Definition**:
The framework-agnostic blueprint produced by `defineContainer` — initial state, actions, and derivations. Pure data and pure functions; no renderer, no I/O.
_Avoid_: schema, config, slice.

**Store**:
A live, instantiated Container Definition. Signal-backed, stateful, disposable. One per component (local) or per provider (lifted).
_Avoid_: container instance, model.

**Action**:
A named, typed state transition. Takes the current state and an optional payload, returns the next state.
_Avoid_: event, command, mutation.

**Derivation**:
An auto-tracked computed value read off state. Recomputes only when the signals it reads change.
_Avoid_: computed (overloaded), getter, selector (a selector is the *read* of a derivation/state at the renderer edge).

**Signal Engine**:
The third-party reactive primitive library powering reactivity (e.g. `@preact/signals-core`, `alien-signals`).
_Avoid_: reactive core, observable lib.

**Signal Façade**:
`@re-reduced/signals` — the internal uniform wrapper over the Signal Engine that keeps the engine swappable. Core and adapters program against the façade, not the engine directly.
_Avoid_: signal wrapper, shim.

**Adapter**:
A framework-specific package (`@re-reduced/react`, `@re-reduced/preact`) that binds a Store to a renderer's reactivity.
_Avoid_: binding (use as a verb only), integration.

**Effect Intent**:
A side-effect *request* a Container declares but does not execute. An Adapter interprets it. The escape hatch for "server data participates in a transition" — not the default path for rendering server data.
_Avoid_: command, saga, thunk.
