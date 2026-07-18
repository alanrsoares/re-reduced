---
"@re-reduced/core": patch
"@re-reduced/react": patch
"@re-reduced/preact": patch
"@re-reduced/adapter-kit": patch
---

Fix published packages still resolving `main`/`types`/`exports` to `src/*.ts` instead of the built `dist/` output. npm does not apply `publishConfig` field promotion on this toolchain (verified: plain `npm pack` left `main`/`types`/`exports` untouched), so every published tarball shipped pointing at raw TypeScript source. This broke consumers with strict tsconfig settings (e.g. `noUncheckedIndexedAccess`), which ended up type-checking this library's internals against their own compiler flags. Added a `prepack`/`postpack` script pair that swaps `publishConfig` values into the real fields only for the packed tarball, then restores the dev-facing (`src`) values afterward so in-repo workspace resolution is unaffected. Also fixed the `publishConfig` values themselves, which pointed at nonexistent `dist/index.js`/`dist/index.d.ts` — `tsdown`'s actual output is `dist/index.cjs`/`dist/index.mjs`/`dist/index.d.cts`/`dist/index.d.mts`.
