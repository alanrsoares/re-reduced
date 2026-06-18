"use client";

import { makeQueryInterpreter } from "@re-reduced/adapter-kit";
// The container is the SHARED one from @re-reduced/demos — same logic the
// example apps run. Only this view (docs-styled) is local.
import { type Filter, queryClient, todos } from "@re-reduced/demos";
import { useContainer, useSelect } from "@re-reduced/react";
import { useEffect } from "react";

const FILTERS: Filter[] = ["all", "active", "done"];

export function TodoDemo() {
  const store = useContainer(todos, {
    interpreters: { query: makeQueryInterpreter(queryClient) },
  });
  const draft = useSelect(store, (s) => s.draft.value);
  const filter = useSelect(store, (s) => s.filter.value);
  const visible = useSelect(store, (_s, d) => d.visible.value);
  const active = useSelect(store, (_s, d) => d.activeCount.value);
  const canSubmit = useSelect(store, (_s, d) => d.canSubmit.value);

  useEffect(() => {
    store.actions.load();
  }, [store]);

  return (
    <div className="not-prose rounded-xl border border-fd-border bg-fd-card p-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          store.actions.submit();
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
          disabled={!canSubmit}
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
              onChange={() => store.actions.toggled({ id: todo.id })}
            />
            <span className={todo.done ? "flex-1 text-fd-muted-foreground line-through" : "flex-1"}>
              {todo.title}
            </span>
            <button
              type="button"
              className="text-fd-muted-foreground hover:text-fd-primary"
              onClick={() => store.actions.removed({ id: todo.id })}
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
