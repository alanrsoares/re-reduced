import { describe, expect, it } from "bun:test";
import { expectType, type TypeEqual } from "ts-expect";
import { createContainer, defineContainer } from "./container";
import type { ReadSignal } from "./signals";

type Todo = { id: string; title: string; done: boolean };
type Filter = "all" | "active" | "done";

const def = defineContainer("todos", {
	state: { draft: "", filter: "all" as Filter, todos: [] as Todo[] },
	actions: (on) => ({
		draftChanged:  on<string>((s, draft) => ({ ...s, draft })),
		filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
		todoAdded:     on<Todo>((s, t) => ({ ...s, todos: [t, ...s.todos] })),
		clear:         on((s) => ({ ...s, todos: [] })),
	}),
	derive: ($) => ({
		canSubmit: () => $.draft.value.trim().length > 0,
	}),
});

// Compile-time only: tsc checks this; it is never invoked, so the
// `@ts-expect-error` calls never execute at runtime.
// biome-ignore lint/correctness/noUnusedVariables: type-level assertions, checked by tsc
function _typeAssertions() {
	const c = createContainer(def);

	expectType<TypeEqual<typeof c.$state.draft, ReadSignal<string>>>(true);
	expectType<TypeEqual<typeof c.$state.filter, ReadSignal<Filter>>>(true);
	expectType<TypeEqual<typeof c.$state.todos, ReadSignal<Todo[]>>>(true);
	expectType<TypeEqual<typeof c.$derived.canSubmit, ReadSignal<boolean>>>(true);

	expectType<TypeEqual<Parameters<typeof c.actions.draftChanged>, [payload: string]>>(true);
	expectType<TypeEqual<Parameters<typeof c.actions.todoAdded>, [payload: Todo]>>(true);
	expectType<TypeEqual<Parameters<typeof c.actions.clear>, []>>(true);

	// @ts-expect-error wrong payload type
	c.actions.filterChanged("nope");
	// @ts-expect-error void action takes no argument
	c.actions.clear(1);

	const sel = c.select((s, d) => (d.canSubmit.value ? s.draft.value : ""));
	expectType<TypeEqual<typeof sel, ReadSignal<string>>>(true);
}

describe("M1 — inference", () => {
	it("compiles the type assertions (enforced by tsc) and runs cleanly", () => {
		const c = createContainer(def);
		expect(c.getState().filter).toBe("all");
		c.actions.filterChanged("done");
		expect(c.getState().filter).toBe("done");
	});
});
