---
"@re-reduced/core": minor
"@re-reduced/react": minor
"@re-reduced/preact": minor
---

Add `store.get(key)` and `store.onAction(listener)`, `fx.onMount`, `createTestStore` and a `shallow` equality helper to core. `useSelect` takes an optional `equals` argument in the React and Preact adapters. The storage interpreter no longer throws when storage is unavailable or the value cannot be serialized.
