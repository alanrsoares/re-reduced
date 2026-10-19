---
"@re-reduced/react": patch
---

`useContainer()` values no longer stay subscribed to keys read only in an event handler. Such a key costs at most one extra render, then drops out. Use `store.get(key)` in handlers to avoid it.
