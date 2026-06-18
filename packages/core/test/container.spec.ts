import { describe, expect, it } from "bun:test";
import type { ReadSignal } from "@re-reduced/signals";
import { createContainer, defineContainer } from "../src/container";
import { type BuiltinIntent, storageSet, timeout } from "../src/intents";
import {
	makeStorageInterpreter,
	type StorageBackend,
	timeoutInterpreter,
} from "../src/interpreters";

type Filter = "all" | "active" | "done";

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

/** Models useSyncExternalStore: re-renders only when the selector snapshot changes. */
function mountSelector<T>(sig: ReadSignal<T>) {
	let renders = 0;
	let first = true;
	let current = sig.peek();
	const unmount = sig.subscribe((v) => {
		if (first) {
			first = false;
			return;
		}
		current = v;
		renders += 1;
	});
	return {
		get renders() {
			return renders;
		},
		value: () => current,
		unmount,
	};
}

const makeApp = () => {
	const backend: StorageBackend & { store: Map<string, string> } = {
		store: new Map(),
		setItem(k, v) {
			this.store.set(k, v);
		},
	};
	const def = defineContainer<BuiltinIntent>()("counter", {
		state: { count: 0, filter: "all" as Filter, label: "" },
		actions: (on) => ({
			inc: on((s) => ({ ...s, count: s.count + 1 })),
			filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
			ping: on((s) => s),
			pinged: on((s) => ({ ...s, label: "pong" })),
		}),
		derive: ($) => ({
			doubled: () => $.count.value * 2,
		}),
		effects: (fx) => {
			fx.onChange(
				(s) => s.filter.value,
				(filter) => storageSet("filter", filter),
			);
			fx.onEnter(
				(s) => s.count.value >= 3,
				() => storageSet("milestone", true),
			);
			fx.onAction("ping", (_p, { actions }) =>
				timeout(15, () => actions.pinged()),
			);
		},
	});
	const store = createContainer(def, {
		interpreters: {
			query: () => {},
			timeout: timeoutInterpreter,
			storageSet: makeStorageInterpreter(backend),
		},
	});
	return { store, backend };
};

describe("@re-reduced/core — container", () => {
	it("re-renders only selectors whose slice changed (fine-grained)", () => {
		const { store } = makeApp();
		const count = mountSelector(store.select((s) => s.count.value));
		const filter = mountSelector(store.select((s) => s.filter.value));

		store.actions.inc();
		expect(count.renders).toBe(1);
		expect(filter.renders).toBe(0);

		store.actions.filterChanged("done");
		expect(filter.renders).toBe(1);
		expect(count.renders).toBe(1);
	});

	it("derivations recompute only when tracked inputs change", () => {
		const { store } = makeApp();
		const doubled = mountSelector(store.select((_s, d) => d.doubled.value));
		store.actions.inc();
		expect(doubled.value()).toBe(2);
		expect(doubled.renders).toBe(1);
		store.actions.filterChanged("active"); // doubled reads only count → no recompute
		expect(doubled.renders).toBe(1);
	});

	it("onChange emits storage intent only on change", () => {
		const { store, backend } = makeApp();
		store.actions.filterChanged("done");
		expect(backend.store.get("filter")).toBe(JSON.stringify("done"));
		backend.store.clear();
		store.actions.filterChanged("done"); // unchanged
		expect(backend.store.has("filter")).toBe(false);
	});

	it("onEnter fires when a predicate transitions into true", () => {
		const { store, backend } = makeApp();
		store.actions.inc();
		store.actions.inc();
		expect(backend.store.has("milestone")).toBe(false);
		store.actions.inc(); // count === 3
		expect(backend.store.get("milestone")).toBe(JSON.stringify(true));
	});

	it("onAction → timeout interpreter dispatches back; destroy cancels it", async () => {
		const a = makeApp();
		a.store.actions.ping();
		await tick(30);
		expect(a.store.getState().label).toBe("pong");

		const b = makeApp();
		b.store.actions.ping();
		b.store.destroy();
		await tick(30);
		expect(b.store.getState().label).toBe("");
	});
});
