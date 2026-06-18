# @re-reduced/biome-plugin

Biome [GritQL](https://biomejs.dev/linter/plugins/) lint rules for the
`re-reduced` container API — catching **type-valid but semantically-wrong**
usage that TypeScript can't see.

## Rules

- **no-unstable-selector** — a `useSelect` selector that returns a fresh object
  or array literal (`(s) => ({ … })` / `(s) => [ … ]`). It type-checks, but
  produces a new reference every call, defeating the snapshot bail-out so the
  component re-renders on **every** store update. Return a primitive or stable
  reference, or split into multiple `useSelect` calls.

## Usage

```jsonc
// biome.json
{
  "plugins": [
    "./node_modules/@re-reduced/biome-plugin/rules/no-unstable-selector.grit"
  ]
}
```

Requires `@biomejs/biome >= 2.0`.
