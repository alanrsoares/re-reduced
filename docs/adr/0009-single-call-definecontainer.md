# Single-call defineContainer; effects return their reactions

`defineContainer(name, def)` is a single call. `state`/`actions`/`derive` are
inferred from the body, and the **effect-intent union is inferred from the
reactions the `effects` block returns** — there is no explicit type argument and
no curried second call.

```ts
defineContainer("todos", {
  state, actions, derive,
  effects: (fx) => [ fx.onAction("load", ...), fx.onChange(...) ],
});
```

## Context

The first cut was curried — `defineContainer<Intent>()(name, def)` — because the
intent union `I` had to be supplied explicitly (it couldn't be inferred while the
`effects` builder registered reactions via void-returning calls). The double call
was the one awkward seam in the API.

## Decision

Make the `effects` builder methods (`onAction`/`onChange`/`onEnter`) **return**
`Reaction` descriptors, and have `effects` return the array of them. Each
descriptor carries its emitted intent type via a covariant phantom, so a mapped
conditional (`IntentOf`) infers the union from the returned tuple — `never` when
there are no effects. `createContainer` consumes the returned reactions instead
of relying on registration side-effects.

## Consequences

- One call, no type arguments; the typed interpreter-coverage check (ADR-0006)
  is preserved because the inferred `I` is precise.
- Supersedes the curried form. Reactions are now values (declarative array),
  which also reads better. ADR-0005 still holds: reactions observe committed
  state and never return state.
