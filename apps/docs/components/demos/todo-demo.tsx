"use client";

import { defineContainer } from "@re-reduced/core";
import { useContainer, useSelect } from "@re-reduced/react";

type Filter = "all" | "active" | "done";
type Item = { id: number; title: string; done: boolean };

// The exact same kind of definition the example apps use — framework-agnostic.
const todos = defineContainer()("demo-todos", {
  state: {
    draft: "",
    seq: 2,
    filter: "all" as Filter,
    items: [
      { id: 1, title: "Learn re-reduced", done: true },
      { id: 2, title: "Build something", done: false },
    ] as Item[],
  },
  actions: (on) => ({
    draftChanged: on<string>((s, draft) => ({ ...s, draft })),
    add: on((s) =>
      s.draft.trim() === ""
        ? s
        : {
            ...s,
            seq: s.seq + 1,
            draft: "",
            items: [{ id: s.seq + 1, title: s.draft.trim(), done: false }, ...s.items],
          },
    ),
    toggle: on<number>((s, id) => ({
      ...s,
      items: s.items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),
    remove: on<number>((s, id) => ({ ...s, items: s.items.filter((t) => t.id !== id) })),
    filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
  }),
  derive: ($) => ({
    visible: () => {
      const f = $.filter.value;
      return $.items.value.filter((t) => (f === "active" ? !t.done : f === "done" ? t.done : true));
    },
    activeCount: () => $.items.value.filter((t) => !t.done).length,
  }),
});

const FILTERS: Filter[] = ["all", "active", "done"];

export function TodoDemo() {
  const store = useContainer(todos);
  const draft = useSelect(store, (s) => s.draft.value);
  const filter = useSelect(store, (s) => s.filter.value);
  const visible = useSelect(store, (_s, d) => d.visible.value);
  const active = useSelect(store, (_s, d) => d.activeCount.value);

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card p-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          store.actions.add();
        }}
      >
        <input
          className="flex-1 rounded-md border border-fd-border bg-fd-background px-3 py-1.5 text-sm"
          placeholder="What needs to be done?"
          value={draft}
          onChange={(e) => store.actions.draftChanged(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-md bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground disabled:opacity-40"
          disabled={draft.trim() === ""}
        >
          Add
        </button>
      </form>

      <ul className="my-3 flex flex-col gap-1">
        {visible.map((todo) => (
          <li key={todo.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => store.actions.toggle(todo.id)}
            />
            <span className={todo.done ? "flex-1 text-fd-muted-foreground line-through" : "flex-1"}>
              {todo.title}
            </span>
            <button
              type="button"
              className="text-fd-muted-foreground hover:text-fd-primary"
              onClick={() => store.actions.remove(todo.id)}
              aria-label="remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-xs text-fd-muted-foreground">
        <span>{active} left</span>
        <span className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => store.actions.filterChanged(f)}
              className={f === filter ? "font-semibold text-fd-primary" : ""}
            >
              {f}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}
