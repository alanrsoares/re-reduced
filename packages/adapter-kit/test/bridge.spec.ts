import { describe, expect, it } from "bun:test";
import {
	createContainer,
	defineContainer,
	type QueryIntent,
	query,
} from "@re-reduced/core";
import {
	type MutationClientLike,
	type MutationIntent,
	makeMutationInterpreter,
	makeQueryInterpreter,
	mutate,
	type QueryClientLike,
} from "../src";

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

const makeApp = () =>
	defineContainer<QueryIntent | MutationIntent>()("data", {
		// SSOT: store a count + a flag — never the fetched list itself.
		state: { count: 0, saved: false },
		actions: (on) => ({
			load: on((s) => s),
			loaded: on<number>((s, count) => ({ ...s, count })),
			save: on((s) => s),
			markSaved: on((s) => ({ ...s, saved: true })),
		}),
		effects: (fx) => {
			fx.onAction("load", (_p, { actions }) =>
				query<number[]>({
					key: ["todos"],
					run: () => Promise.resolve([1, 2, 3]),
					onData: (rows) => actions.loaded(rows.length),
				}),
			);
			fx.onAction("save", (_p, { actions }) =>
				mutate({
					run: () => Promise.resolve("ok"),
					onSuccess: () => actions.markSaved(),
					invalidates: [["todos"]],
				}),
			);
		},
	});

describe("@re-reduced/adapter-kit — query/mutate bridge", () => {
	const setup = () => {
		const queryClient: QueryClientLike = {
			fetchQuery: ({ queryFn }) =>
				queryFn({ signal: new AbortController().signal }),
		};
		const invalidated: (readonly unknown[])[] = [];
		const mutationClient: MutationClientLike = {
			invalidateQueries: ({ queryKey }) => void invalidated.push(queryKey),
		};
		const store = createContainer(makeApp(), {
			interpreters: {
				query: makeQueryInterpreter(queryClient),
				mutate: makeMutationInterpreter(mutationClient),
			},
		});
		return { store, invalidated };
	};

	it("query result re-enters as an action; the list is never stored (SSOT)", async () => {
		const { store } = setup();
		store.actions.load();
		await tick();
		expect(store.getState().count).toBe(3);
		expect("items" in store.getState()).toBe(false);
	});

	it("mutation success dispatches back and invalidates queries", async () => {
		const { store, invalidated } = setup();
		store.actions.save();
		await tick();
		expect(store.getState().saved).toBe(true);
		expect(invalidated).toEqual([["todos"]]);
	});

	it("disposal aborts an in-flight mutation (success does not re-enter)", async () => {
		const { store } = setup();
		store.actions.save(); // mutation promise pending on the microtask queue
		store.destroy(); // abort before it settles
		await tick();
		expect(store.getState().saved).toBe(false);
	});
});
