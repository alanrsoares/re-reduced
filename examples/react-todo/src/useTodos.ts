import { makeQueryInterpreter } from "@re-reduced/adapter-kit";
import { useContainer } from "@re-reduced/react";
import { queryClient } from "./api";
import { todos } from "./todos.container";

/** Wires the container's query intent to the (stub) data layer. */
export function useTodos() {
	return useContainer(todos, {
		interpreters: { query: makeQueryInterpreter(queryClient) },
	});
}
