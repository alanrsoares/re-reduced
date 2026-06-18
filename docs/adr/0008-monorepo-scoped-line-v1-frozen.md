# Monorepo, scoped v2 line, v1 frozen as re-reduced@2

This repo becomes a bun-workspaces monorepo (preserving history, the type harness, CONTEXT/ADRs). The v2 line ships scoped-only — `@re-reduced/{core,signals,react,preact,adapter-kit}` — starting at `0.x` and graduating to `1.0`. The existing v1 library moves to `packages/legacy` and continues publishing as **`re-reduced@2.x`, frozen**, so existing `^2` consumers are untouched.

## Context

v1 is a Redux/redux-saga helper; v2 is a signal-based, component-scoped container — a different paradigm with no meaningful automated migration.

## Consequences

- Existing `re-reduced@^2` users keep working indefinitely; no forced migration. A *conceptual* v1→v2 guide is provided, not a codemod.
- The unscoped `re-reduced` name is **not** claimed as a v3 meta-package now; that is deferred until the scoped line proves itself.
- New packages live under `packages/*`; `packages/legacy` is the frozen v1.
