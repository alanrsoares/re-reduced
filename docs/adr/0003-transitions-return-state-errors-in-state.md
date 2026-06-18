# Synchronous transitions return State; errors live in state

Actions are pure `(state, payload) => state`. They never return a `Result`. A fallible domain rule writes a discriminated-union error field into state (e.g. `submitError: "empty" | null`); dispatch returns `void`; validity is exposed as a Derivation (`canSubmit`) the view reads before dispatching.

## Context

The functional-TS instinct (and an earlier draft) was to have fallible transitions return `Result<State, E>` and `match` at the dispatch site. A senior-React review rejected this: it creates two error channels (the returned `Err` and state), forces `match` ceremony at every dispatch, and gives dispatch a return type that varies per action.

## Consequences

- Core reducer type stays `(state, payload) => state` — keeps the proven action-registry type inference unchanged.
- Rich failures are modelled as discriminated-union fields in state, branched on once at render, not per dispatch.
- `Result`-returning fallibility belongs in the effects/services layer, not in synchronous state transitions.
