# @re-reduced/adapter-kit

## 0.2.3

### Patch Changes

- dddefa0: Fix published packages still resolving `main`/`types`/`exports` to `src/*.ts` instead of the built `dist/` output. npm does not apply `publishConfig` field promotion on this toolchain (verified: plain `npm pack` left `main`/`types`/`exports` untouched), so every published tarball shipped pointing at raw TypeScript source. This broke consumers with strict tsconfig settings (e.g. `noUncheckedIndexedAccess`), which ended up type-checking this library's internals against their own compiler flags. Added a `prepack`/`postpack` script pair that swaps `publishConfig` values into the real fields only for the packed tarball, then restores the dev-facing (`src`) values afterward so in-repo workspace resolution is unaffected. Also fixed the `publishConfig` values themselves, which pointed at nonexistent `dist/index.js`/`dist/index.d.ts` — `tsdown`'s actual output is `dist/index.cjs`/`dist/index.mjs`/`dist/index.d.cts`/`dist/index.d.mts`.
- Updated dependencies [dddefa0]
  - @re-reduced/core@0.3.2

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
