import { describe, expect, it } from "bun:test";
import { expectType, type TypeEqual } from "ts-expect";

import { type Action, createSlice } from "./core";

/**
 * Inference + exhaustiveness assertions for the v2 union-registry spike.
 * Enforced by `tsc` — runtime bodies are sanity checks only.
 */
describe("v2 core spike", () => {
	const counter = createSlice("counter", { count: 0 }, (on) => ({
		increment: on((s) => ({ count: s.count + 1 })),
		add: on<number>((s, n) => ({ count: s.count + n })),
		reset: on(() => ({ count: 0 })),
	}));

	it("infers action-creator signatures with zero any", () => {
		// void-payload creator takes no args, omits payload key
		expectType<
			TypeEqual<
				typeof counter.actions.increment,
				() => { readonly type: "counter/increment" }
			>
		>(true);

		// number-payload creator requires the payload
		expectType<TypeEqual<Parameters<typeof counter.actions.add>, [payload: number]>>(
			true,
		);

		const added = counter.actions.add(5);
		expectType<
			TypeEqual<
				typeof added,
				{ readonly type: "counter/add"; readonly payload: number }
			>
		>(true);

		// @ts-expect-error payload must be a number
		counter.actions.add("nope");
		// @ts-expect-error void action takes no argument
		counter.actions.increment(1);

		expect(counter.actions.add(5)).toEqual({ type: "counter/add", payload: 5 });
		expect(counter.actions.increment()).toEqual({ type: "counter/increment" });
	});

	it("builds a discriminated action union", () => {
		// the reducer's action arg is the full union of all slice actions
		type ReducerAction = Parameters<typeof counter.reducer>[1];
		expectType<
			TypeEqual<
				ReducerAction,
				| Action<"counter/increment", void>
				| Action<"counter/add", number>
				| Action<"counter/reset", void>
			>
		>(true);
	});

	it("supports exhaustive matching (missing case = compile error)", () => {
		type A = Parameters<typeof counter.reducer>[1];

		const label = (action: A): string => {
			switch (action.type) {
				case "counter/increment":
					return "inc";
				case "counter/add":
					return `add ${action.payload}`;
				case "counter/reset":
					return "reset";
				default: {
					// exhaustiveness guard — unreachable only if every case handled
					const _never: never = action;
					return _never;
				}
			}
		};

		expect(label(counter.actions.add(3))).toBe("add 3");
	});

	it("reduces with correct payload types at runtime", () => {
		const s0 = counter.initialState;
		const s1 = counter.reducer(s0, counter.actions.add(10));
		expect(s1.count).toBe(10);
		const s2 = counter.reducer(s1, counter.actions.increment());
		expect(s2.count).toBe(11);
		const s3 = counter.reducer(s2, counter.actions.reset());
		expect(s3.count).toBe(0);
	});
});
