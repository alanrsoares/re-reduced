import { describe, expect, it } from "bun:test";
import { createContainer, defineContainer } from "./container";
import { mountSelector } from "./uses";

type Todo = { id: string; title: string; done: boolean };
type Filter = "all" | "active" | "done";

let deriveRuns = { canSubmit: 0, visibleCount: 0 };

const makeTodos = () => {
	deriveRuns = { canSubmit: 0, visibleCount: 0 };
	const def = defineContainer("todos", {
		state: { draft: "", filter: "all" as Filter, todos: [] as Todo[] },
		actions: (on) => ({
			draftChanged:  on<string>((s, draft) => ({ ...s, draft })),
			filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
			todoAdded:     on<Todo>((s, t) => ({ ...s, todos: [t, ...s.todos] })),
			noop:          on((s) => s),
		}),
		derive: ($) => ({
			canSubmit: () => {
				deriveRuns.canSubmit += 1;
				return $.draft.value.trim().length > 0;
			},
			visibleCount: () => {
				deriveRuns.visibleCount += 1;
				const f = $.filter.value;
				return $.todos.value.filter((t) => (f === "active" ? !t.done : f === "done" ? t.done : true)).length;
			},
		}),
	});
	return createContainer(def);
};

describe("M1 — fine-grained signal container", () => {
	it("dispatch only re-renders selectors whose slice changed", () => {
		const c = makeTodos();
		const draft = mountSelector(c, (s) => s.draft.value);
		const filter = mountSelector(c, (s) => s.filter.value);
		const todos = mountSelector(c, (s) => s.todos.value);

		c.actions.draftChanged("a");
		expect(draft.renders).toBe(1);   // draft reader re-renders
		expect(filter.renders).toBe(0);  // ← VDOM-bypass: untouched slices do NOT
		expect(todos.renders).toBe(0);

		c.actions.filterChanged("done");
		expect(filter.renders).toBe(1);
		expect(draft.renders).toBe(1);   // unchanged
		expect(todos.renders).toBe(0);

		c.actions.todoAdded({ id: "1", title: "x", done: false });
		expect(todos.renders).toBe(1);
		expect(draft.renders).toBe(1);
		expect(filter.renders).toBe(1);
	});

	it("derivations recompute only when their tracked inputs change", () => {
		const c = makeTodos();
		const canSubmit = mountSelector(c, (_s, d) => d.canSubmit.value);

		c.actions.draftChanged("a");           // false -> true
		expect(canSubmit.value()).toBe(true);
		expect(canSubmit.renders).toBe(1);

		c.actions.draftChanged("ab");          // still true → no re-render (value bail-out)
		expect(canSubmit.renders).toBe(1);

		const runsAfterDraft = deriveRuns.canSubmit;
		c.actions.filterChanged("done");       // canSubmit reads only draft → must NOT recompute
		c.actions.todoAdded({ id: "1", title: "x", done: true });
		expect(deriveRuns.canSubmit).toBe(runsAfterDraft);
	});

	it("dispatching an unchanged field is a no-op (shallow Object.is diff)", () => {
		const c = makeTodos();
		const draft = mountSelector(c, (s) => s.draft.value);
		c.actions.noop();                      // returns same state
		c.actions.draftChanged("");            // same value ""
		expect(draft.renders).toBe(0);
	});

	it("getState returns a glitch-free snapshot", () => {
		const c = makeTodos();
		c.actions.draftChanged("hello");
		c.actions.filterChanged("active");
		expect(c.getState()).toEqual({ draft: "hello", filter: "active", todos: [] });
	});
});
