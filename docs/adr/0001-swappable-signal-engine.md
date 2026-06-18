# Swappable signal engine behind a façade

The reactive core is built on a third-party Signal Engine, but core and adapters program against an internal `@re-reduced/signals` façade rather than importing the engine directly. The default engine is `@preact/signals-core` (chosen for first-class React + Preact integration), with `alien-signals` as a likely future swap when Solid/Vue targets land.

## Considered Options

- **Import `@preact/signals-core` directly throughout** — simplest, but couples every package to one engine; swapping later touches the whole tree.
- **Façade over a swappable engine (chosen)** — one small indirection; engine choice is a single internal decision; adapters stay engine-agnostic.

## Consequences

- A hard dependency on a signal engine in core (not zero-dep) — accepted; it is the reactivity substrate.
- The façade contract is the constraint: anything an adapter needs must be expressible through it. Engine-specific fast paths (e.g. native Preact JSX auto-subscription) require deliberately exposing an escape hatch through the façade rather than reaching past it.
- **Swappability is the invariant; native rendering is an opt-in fast path.** All adapters bind through the façade by default. The Preact adapter additionally exposes `.raw` (the underlying native signal) so users can drop it into JSX for zero-hook, VDOM-bypassing updates — but only when running the default `@preact/signals` engine. Swapping the engine silently degrades the fast path to hook-based binding.
