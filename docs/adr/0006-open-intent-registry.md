# Open tagged-intent registry; interpreters split core/adapter

Effect intents are tagged unions (`{ kind: "query", ... }`). Interpreters are registered in a `kind → interpreter` map, open for user-defined kinds. The interpreter signature is uniform: `(intent, { dispatch, signal }) => void | (() => void)` — receives an `AbortSignal` tied to Store disposal and may return a cleanup.

## Where interpreters live

- **Core** ships renderer-agnostic interpreters: `timeout`, `interval`, `storage`.
- **Adapters** ship the server bridge: `query` / `mutate` interpret into the host data layer (useQuery/useMutation) and dispatch results back as actions. They live in the adapter because that is where the data layer and renderer lifecycle are.
- **Users** register custom domain intent kinds without a core release.

## Consequences

- The Store's intent union is statically known, so the registry enforces **key coverage** at compile time — a missing interpreter is a type error, not just a runtime miss.
- An open registry (vs a fixed closed interpreter interface) trades a little indirection for extensibility and the core/adapter split.
