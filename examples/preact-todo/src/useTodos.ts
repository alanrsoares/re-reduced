import { makeQueryInterpreter } from "@re-reduced/adapter-kit";
import { queryClient, todos } from "@re-reduced/demos";
import { useContainer } from "@re-reduced/preact";

export function useTodos() {
  return useContainer(todos, {
    interpreters: { query: makeQueryInterpreter(queryClient) },
  });
}
