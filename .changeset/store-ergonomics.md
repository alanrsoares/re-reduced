---
"@re-reduced/core": minor
"@re-reduced/react": minor
---

Add `store.get(key)` and `store.onAction(listener)`, `fx.onMount`, `createTestStore` and a `shallow` equality helper to core. Add `storageRemove`, `makeStorageRemoveInterpreter` and `readStored` for storage. `useSelect` takes an optional `equals` argument in the React adapter. The storage interpreters no longer throw when storage is unavailable or the value cannot be serialized.
