import type { QueryClientLike } from "@re-reduced/adapter-kit";
import type { Todo } from "./todos.container";

const SEED: Todo[] = [
  { id: "seed-1", title: "Learn re-reduced", done: true },
  { id: "seed-2", title: "Build something", done: false },
];

export const api = {
  list: (): Promise<Todo[]> => Promise.resolve(SEED),
};

/**
 * A minimal QueryClient — enough for the query interpreter to bridge to.
 * In a real app you'd pass your TanStack `QueryClient` (which has the same
 * imperative `fetchQuery`) instead of this stub.
 */
export const queryClient: QueryClientLike = {
  fetchQuery: ({ queryFn }) =>
    queryFn({ signal: new AbortController().signal }),
};
