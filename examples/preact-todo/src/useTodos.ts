import { makeQueryInterpreter } from "@re-reduced/adapter-kit";
import { queryClient, todos } from "@re-reduced/demos";
import { useContainer } from "@re-reduced/preact";

export const useTodos = () =>
  useContainer(todos, {
    interpreters: { query: makeQueryInterpreter(queryClient) },
  });
