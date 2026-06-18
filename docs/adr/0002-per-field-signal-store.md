# Per-field signals with shallow-diff dispatch

A Store holds one signal per top-level state key, not a single signal over the whole state object. Reducers still author whole-state immutably (`(s) => ({ ...s, draft })`); on dispatch the store shallow-diffs the returned object against current state and writes only the changed keys to their signals. Derivations are `computed` values that auto-track whichever field signals they read.

## Considered Options

- **Single `signal<State>`** — simplest, but every action notifies every reader; over-render avoidance rests entirely on selector/computed equality bail-out.
- **Per-top-level-field signals (chosen)** — structural field-level granularity while preserving immutable reducer ergonomics.
- **Deep/nested proxy signals** — maximal (per-item) granularity, but proxy complexity that fights the immutable-reducer model.

## Consequences

- Equality is shallow `Object.is` per top-level key. Reducers must return the **same reference** for unchanged fields (standard immutable practice); rebuilding a structurally-identical object for an untouched key notifies spuriously.
- Deep granularity (e.g. signal-per-list-item for very large lists) is an **opt-in advanced pattern**, not the default.
