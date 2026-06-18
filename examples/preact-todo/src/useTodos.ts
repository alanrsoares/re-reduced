import { makeQueryInterpreter } from "@re-reduced/adapter-kit";
import { useContainer } from "@re-reduced/preact";
import { queryClient } from "./api";
import { todos } from "./todos.container";

export function useTodos() {
  return useContainer(todos, {
    interpreters: { query: makeQueryInterpreter(queryClient) },
  });
}
