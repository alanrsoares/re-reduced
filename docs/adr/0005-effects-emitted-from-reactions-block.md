# Effect intents emitted from a separate reactions block

Intents are not returned from reducers. The Container Definition has a third block, `effects`, whose entries *react* to triggers and emit intents. Triggers are either an action (`fx.onAction`) or a state predicate/derivation (`fx.onEnter` / `fx.onChange`), the latter implemented as signal `effect()` subscriptions (auto-tracked).

## Considered Options

- **Reactions block (chosen)** — keeps reducers pure `(s,p)=>s` (ADR-0003) and the action-registry type inference intact; effects testable in isolation.
- **Elm update tuple `(s,p) => [State, Intent[]]`** — truest to Elm, but breaks ADR-0003 and the proven type spike, and couples every action signature to effects.
- **Context emitter `(s,p,fx) => State`** — single block, but re-pollutes reducers with effect concerns.

## Consequences

- Reactions observe **committed** state/actions; they cannot emit atomically alongside the transition the way Elm does. The reaction fires synchronously after commit, in the same batch — acceptable in practice.
