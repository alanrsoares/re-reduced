# Action handlers return changed keys (merged), backed by a state mirror

Action handlers return a `Partial<S>` of the keys that changed; the store merges
them. A one-field update is `(s) => ({ count: s.count + 1 })` — no `...s` spread.
`state` is passed read-only.

## Context

Handlers were typed `(state) => state`, which forced every handler to spread the
whole state to satisfy the type, even to change one field. The commit path
already only wrote the keys the handler returned (omitted keys were untouched),
so the spread was pure overhead — and it made dispatch **O(fields)**: each
dispatch peeked every signal to build the `prev` snapshot, the handler spread
every field, and the diff walked every key. A one-field bump in a 64-field
container cost ~1.4 µs; the dominant term was the eager snapshot, not the spread.

A lazy state **proxy** was tried earlier and rejected (ADR rationale): it made
spread handlers ~7× slower because spreading enumerates every field through the
proxy traps.

## Decision

- Handler return type is `Partial<S>`; returned keys are merged into state.
  Spreads still type-check (full `S` is assignable to `Partial<S>`), so this is
  backward compatible — but the spread is now optional and discouraged.
- `state` is typed `Readonly<S>`. The store hands the handler the **live mirror**
  (not a copy), so mutating it would corrupt state; `Readonly<S>` makes that a
  compile error at zero runtime cost.
- The store keeps a plain-object **mirror** of state, updated in the same commit
  loop that writes the signals. `getState()` clones it; dispatch reads it
  directly. Neither peeks every signal per call.

## Consequences

- Dispatch is **O(changed keys)**, not O(fields): a one-field bump is flat (~60
  ns) regardless of container size — measured ~23× faster at 64 fields, and now
  flatter than Zustand instead of behind it.
- This is a plain cached object, not a proxy, so it has none of the per-access
  trap overhead that sank the lazy-proxy attempt.
- Handlers must stay pure (never mutate `state`); `Readonly<S>` enforces it for
  TypeScript callers. `getState()`'s clone keeps external mutation contained.
- Supersedes the "dispatch is O(fields), a deliberate tradeoff" framing.
