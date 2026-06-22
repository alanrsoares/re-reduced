---
"@re-reduced/react": minor
---

Context-bound hooks + destructuring reads (unstated-next ergonomics).

`createContainerContext` now returns context-bound hooks so consumers never
thread the store: `Counter.useContainer()` destructures values **and** actions in
one object (`const { count, increment } = Counter.useContainer()`),
`Counter.useSelect(sel)` reads one slice, `Counter.useActions()` the action map.
`Counter.use()` still returns the raw Store.

New standalone `useStoreValues(store)` returns a proxy over state + derived where
reading a key during render subscribes the component to **that key only** — the
per-field bail-out is preserved (destructure the keys you read; don't spread).
