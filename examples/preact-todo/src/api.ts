import type { QueryClientLike } from "@re-reduced/adapter-kit";
import type { Todo } from "./todos.container";

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
