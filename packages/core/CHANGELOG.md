# @re-reduced/core

## 0.3.0

### Minor Changes

- 96a32eb: O(1) dispatch via a state mirror, and partial-return action handlers.

  Handlers now return only the keys that changed (`Partial<S>`, merged into state) —
  a one-field update is `(s) => ({ count: s.count + 1 })`, no `...s` spread. `state`
  is passed read-only. The store keeps a plain-object mirror of state in sync with
  the signals, so dispatch is O(changed keys) instead of O(fields): a one-field bump
  is flat regardless of container size (~23× faster at 64 fields). Full-`S` returns
  still type-check, so existing handlers keep working. See ADR-0010.

## 0.2.0

### Minor Changes

- b52057b: Initial v2 release: signal-backed, functional, component-scoped state container
  with React and Preact adapters, plus a Biome plugin for the container API.

### Patch Changes

- Updated dependencies [b52057b]
  - @re-reduced/signals@0.2.0
