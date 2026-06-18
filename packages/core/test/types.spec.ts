import { describe, expect, it } from "bun:test";
import type { ReadSignal } from "@re-reduced/signals";
import { expectType, type TypeEqual } from "ts-expect";
import {
	createContainer,
	defineContainer,
	type Interpreters,
} from "../src/container";
import type { BuiltinIntent } from "../src/intents";

type Filter = "all" | "active" | "done";

const def = defineContainer<BuiltinIntent>()("todos", {
	state: { draft: "", filter: "all" as Filter, count: 0 },
	actions: (on) => ({
		draftChanged: on<string>((s, draft) => ({ ...s, draft })),
		filterChanged: on<Filter>((s, filter) => ({ ...s, filter })),
		clear: on((s) => ({ ...s, count: 0 })),
	}),
	derive: ($) => ({ canSubmit: () => $.draft.value.trim().length > 0 }),
});

type A = { loaded: (n: number) => void };

// Compile-time only (uncalled): tsc enforces these; bun never runs them.
function _typeAssertions() {
	const c = createContainer(def, {
		interpreters: { query: () => {}, timeout: () => {}, storageSet: () => {} },
	});

	expectType<TypeEqual<typeof c.$state.draft, ReadSignal<string>>>(true);
	expectType<TypeEqual<typeof c.$state.filter, ReadSignal<Filter>>>(true);
	expectType<TypeEqual<typeof c.$derived.canSubmit, ReadSignal<boolean>>>(true);
	expectType<
		TypeEqual<Parameters<typeof c.actions.draftChanged>, [payload: string]>
	>(true);
	expectType<TypeEqual<Parameters<typeof c.actions.clear>, []>>(true);

	// @ts-expect-error wrong payload type
	c.actions.filterChanged("nope");
	// @ts-expect-error void action takes no argument
	c.actions.clear(1);

	// interpreter registry requires coverage of every intent kind and narrows each
	const full: Interpreters<BuiltinIntent, A> = {
		query: (intent) => {
			const _k: readonly unknown[] = intent.key;
			void _k;
		},
		timeout: (intent) => {
			const _ms: number = intent.ms;
			void _ms;
		},
		storageSet: (intent) => {
			const _v: unknown = intent.value;
			void _v;
		},
	};
	void full;

	// @ts-expect-error missing 'storageSet' interpreter
	const partial: Interpreters<BuiltinIntent, A> = {
		query: () => {},
		timeout: () => {},
	};
	void partial;
}

describe("@re-reduced/core — inference", () => {
	it("type assertions compile (enforced by tsc)", () => {
		expect(typeof _typeAssertions).toBe("function");
	});
});
