# @re-reduced/react

## 0.3.0

### Minor Changes

- cfa6f72: Context-bound hooks + destructuring reads (unstated-next ergonomics).

  `createContainerContext` now returns context-bound hooks so consumers never
  thread the store: `Counter.useContainer()` destructures values **and** actions in
  one object (`const { count, increment } = Counter.useContainer()`),
  `Counter.useSelect(sel)` reads one slice, `Counter.useActions()` the action map.
  `Counter.use()` still returns the raw Store.

  New standalone `useStoreValues(store)` returns a proxy over state + derived where
  reading a key during render subscribes the component to **that key only** — the
  per-field bail-out is preserved (destructure the keys you read; don't spread).

### Patch Changes

- f8ff304: Fix published packages being unusable outside this monorepo: `@re-reduced/core`, `@re-reduced/react`, `@re-reduced/preact`, and `@re-reduced/adapter-kit` all declared their internal dependency using the bun/pnpm-only `workspace:*` protocol. Changesets does not rewrite this range at publish time, so every published tarball shipped `workspace:*` verbatim, which `npm install`/`bun add` cannot resolve outside this repo. Replaced with real semver ranges (`^0.3.0`, `^0.2.0`), which bun still resolves to the local workspace package during development.
- Updated dependencies [f8ff304]
  - @re-reduced/core@0.3.1

## 0.2.1

### Patch Changes

- Updated dependencies [96a32eb]
  - @re-reduced/core@0.3.0

## 0.2.0

### Minor Changes

- b52057b: Initial v2 release: signal-backed, functional, component-scoped state container
  with React and Preact adapters, plus a Biome plugin for the container API.

### Patch Changes

- Updated dependencies [b52057b]
  - @re-reduced/core@0.2.0
