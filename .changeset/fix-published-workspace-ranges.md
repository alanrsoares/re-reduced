---
"@re-reduced/core": patch
"@re-reduced/react": patch
"@re-reduced/preact": patch
"@re-reduced/adapter-kit": patch
---

Fix published packages being unusable outside this monorepo: `@re-reduced/core`, `@re-reduced/react`, `@re-reduced/preact`, and `@re-reduced/adapter-kit` all declared their internal dependency using the bun/pnpm-only `workspace:*` protocol. Changesets does not rewrite this range at publish time, so every published tarball shipped `workspace:*` verbatim, which `npm install`/`bun add` cannot resolve outside this repo. Replaced with real semver ranges (`^0.3.0`, `^0.2.0`), which bun still resolves to the local workspace package during development.
