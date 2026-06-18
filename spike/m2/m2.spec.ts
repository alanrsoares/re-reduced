import { describe, expect, it } from "bun:test";
import type { QueryClientLike } from "./adapter-kit";
import { makeQueryInterpreter } from "./adapter-kit";
import { createContainer, defineContainer, type Interpreters } from "./container";
import { type BuiltinIntent, query, storageSet, timeout } from "./intents";
import { makeStorageInterpreter, type StorageBackend, timeoutInterpreter } from "./interpreters";

type Todo = { id: string; done: boolean };
type Filter = "all" | "active" | "done";
type Status = "idle" | "loading" | "ready";

const MOCK_TODOS: Todo[] = [
	{ id: "1", done: false },
	{ id: "2", done: true },
];

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

// SSOT: the container stores a COUNT derived from the fetch, never the list itself.
const makeApp = () =>
	defineContainer<BuiltinIntent>()("app", {
		state: { status: "idle" as Status, count: 0, filter: "all" as Filter },
		actions: (on) => ({
			load:          on((s) => ({ ...s, status: "loading" as const })),
			loaded:        on<number>((s, count) => ({ ...s, status: "ready" as const, count })),
			filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
			ping:          on((s) => s),
		}),
		effects: (fx) => {
			fx.onAction("load", (_p, { actions }) =>
				query<Todo[]>({
					key: ["todos"],
					run: () => Promise.resolve(MOCK_TODOS),
					onData: (todos) => actions.loaded(todos.length), // store summary, not the list
				}),
			);
			fx.onChange(
				(s) => s.filter.value,
				(filter) => storageSet("filter", filter),
			);
			fx.onAction("ping", (_p, { actions }) => timeout(15, () => actions.loaded(999)));
		},
	});

describe("M2 — effects runtime", () => {
	const setup = () => {
		const storage = new Map<string, unknown>();
		const backend: StorageBackend = { set: (k, v) => void storage.set(k, v) };
		let fetches = 0;
		const client: QueryClientLike = {
			fetchQuery: ({ queryFn }) => {
				fetches += 1;
				return queryFn({ signal: new AbortController().signal });
			},
		};
		const store = createContainer(makeApp(), {
			interpreters: {
				query: makeQueryInterpreter(client),
				timeout: timeoutInterpreter,
				storageSet: makeStorageInterpreter(backend),
			},
		});
		return { store, storage, get fetches() { return fetches; } };
	};

	it("onAction emits a query intent; interpreter fetches and result re-enters as an action", async () => {
		const { store } = setup();
		store.actions.load();
		expect(store.getState().status).toBe("loading");
		await tick();
		expect(store.getState().status).toBe("ready");
		expect(store.getState().count).toBe(2); // summary of the fetch, not the list
		expect("todos" in store.getState()).toBe(false); // SSOT: list never stored
	});

	it("onChange emits a storage intent only when the slice changes", () => {
		const { store, storage } = setup();
		store.actions.filterChanged("done");
		expect(storage.get("filter")).toBe("done");
		storage.delete("filter");
		store.actions.filterChanged("done"); // unchanged → no emit
		expect(storage.has("filter")).toBe(false);
	});

	it("timeout interpreter fires after the delay and is cancelled on destroy", async () => {
		const a = setup();
		a.store.actions.ping();
		await tick(30);
		expect(a.store.getState().count).toBe(999);

		const b = setup();
		b.store.actions.ping();
		b.store.destroy(); // cancels the pending timeout
		await tick(30);
		expect(b.store.getState().count).toBe(0);
	});

	it("destroy aborts an in-flight query (result does not re-enter)", async () => {
		const storage = new Map<string, unknown>();
		const backend: StorageBackend = { set: (k, v) => void storage.set(k, v) };
		let resolve!: (v: Todo[]) => void;
		const slow = new Promise<Todo[]>((r) => {
			resolve = r;
		});
		const store = createContainer(makeApp(), {
			interpreters: {
				query: makeQueryInterpreter({ fetchQuery: () => slow }),
				timeout: timeoutInterpreter,
				storageSet: makeStorageInterpreter(backend),
			},
		});
		store.actions.load();
		store.destroy();
		resolve(MOCK_TODOS); // resolves after disposal
		await tick();
		expect(store.getState().count).toBe(0); // onData was guarded by the abort signal
	});
});
