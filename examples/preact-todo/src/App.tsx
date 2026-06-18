/** @jsxImportSource preact */
import { useSelect } from "@re-reduced/preact";
import { useEffect } from "preact/hooks";
import type { Filter } from "./todos.container";
import { useTodos } from "./useTodos";

const FILTERS: Filter[] = ["all", "active", "done"];

export function App() {
  const store = useTodos();
  // useSelect reads the signal's value → @preact/signals subscribes this
  // component fine-grainedly. (For zero-VDOM updates you can also render a
  // signal directly in JSX, e.g. {store.$derived.activeCount}.)
  const draft = useSelect(store, (s) => s.draft.value);
  const filter = useSelect(store, (s) => s.filter.value);
  const status = useSelect(store, (s) => s.status.value);
  const error = useSelect(store, (s) => s.error.value);
  const visible = useSelect(store, (_s, d) => d.visible.value);
  const activeCount = useSelect(store, (_s, d) => d.activeCount.value);
  const canSubmit = useSelect(store, (_s, d) => d.canSubmit.value);

  useEffect(() => {
    store.actions.load();
  }, [store]);

  return (
    <main className="app">
      <h1>todos</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          store.actions.submit();
        }}
      >
        <input
          data-testid="draft"
          class={error ? "draft error" : "draft"}
          placeholder="What needs to be done?"
          value={draft}
          onInput={(e) =>
            store.actions.draftChanged((e.target as HTMLInputElement).value)
          }
        />
        <button type="submit" data-testid="add" disabled={!canSubmit}>
          Add
        </button>
      </form>

      {error && (
        <p class="banner" data-testid="error">
          {error}
        </p>
      )}
      {status === "loading" && <p>Loading…</p>}

      <ul class="list">
        {visible.map((todo) => (
          <li key={todo.id} class={todo.done ? "done" : undefined}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => store.actions.toggled({ id: todo.id })}
            />
            <span>{todo.title}</span>
            <button
              type="button"
              class="destroy"
              onClick={() => store.actions.removed({ id: todo.id })}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <footer class="footer">
        <span data-testid="count">{activeCount} left</span>
        <span class="filters">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              data-testid={`filter-${f}`}
              class={f === filter ? "selected" : undefined}
              onClick={() => store.actions.filterChanged(f)}
            >
              {f}
            </button>
          ))}
        </span>
      </footer>
    </main>
  );
}
