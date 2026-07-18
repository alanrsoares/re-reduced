# @re-reduced/adapter-kit

## 0.2.2

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
