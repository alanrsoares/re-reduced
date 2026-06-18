import type { QueryClientLike } from "@re-reduced/adapter-kit";
import { defineContainer, query } from "@re-reduced/core";

export type Todo = { id: string; title: string; done: boolean };
export type Filter = "all" | "active" | "done";
type Status = "idle" | "loading" | "ready";

let nextId = 0;
const makeId = () => {
  nextId += 1;
  return `t${nextId}`;
};

const SEED: Todo[] = [
  { id: "seed-1", title: "Learn re-reduced", done: true },
  { id: "seed-2", title: "Build something", done: false },
];

export const api = {
  list: (): Promise<Todo[]> => Promise.resolve(SEED),
};

/** Minimal QueryClient stub; in a real app, pass your TanStack QueryClient. */
export const queryClient: QueryClientLike = {
  fetchQuery: ({ queryFn }) =>
    queryFn({ signal: new AbortController().signal }),
};

/**
 * The one shared TODO container. Imported unchanged by the React example, the
 * Preact example, and the docs live demo — the multi-renderer thesis, with a
 * single source of truth.
 */
export const todos = defineContainer("todos", {
  state: {
    draft: "",
    filter: "all" as Filter,
    items: [] as Todo[],
    status: "idle" as Status,
    error: null as string | null,
  },
  actions: (on) => ({
    draftChanged: on<string>((s, draft) => ({ ...s, draft, error: null })),
    filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
    submit: on((s) =>
      s.draft.trim().length === 0
        ? { ...s, error: "Title can't be empty" }
        : {
            ...s,
            items: [
              { id: makeId(), title: s.draft.trim(), done: false },
              ...s.items,
            ],
            draft: "",
          },
    ),
    toggled: on<{ id: string }>((s, { id }) => ({
      ...s,
      items: s.items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),
    removed: on<{ id: string }>((s, { id }) => ({
      ...s,
      items: s.items.filter((t) => t.id !== id),
    })),
    load: on((s) => ({ ...s, status: "loading" as Status })),
    loaded: on<Todo[]>((s, items) => ({
      ...s,
      items,
      status: "ready" as Status,
    })),
    loadFailed: on<string>((s, error) => ({
      ...s,
      status: "ready" as Status,
      error,
    })),
  }),
  derive: ($) => ({
    visible: () => {
      const f = $.filter.value;
      return $.items.value.filter((t) =>
        f === "active" ? !t.done : f === "done" ? t.done : true,
      );
    },
    activeCount: () => $.items.value.filter((t) => !t.done).length,
    canSubmit: () => $.draft.value.trim().length > 0,
  }),
  effects: (fx) => [
    fx.onAction("load", (_payload, { actions }) =>
      query<Todo[]>({
        key: ["todos"],
        run: () => api.list(),
        onData: (items) => actions.loaded(items),
        onError: (error) => actions.loadFailed(String(error)),
      }),
    ),
  ],
});
