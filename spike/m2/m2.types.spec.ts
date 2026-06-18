import { describe, expect, it } from "bun:test";
import type { Interpreters } from "./container";
import type { BuiltinIntent } from "./intents";

type A = { loaded: (n: number) => void };

// Compile-time only (uncalled): proves the registry enforces key coverage and
// narrows each interpreter's intent (ADR-0006).
// biome-ignore lint/correctness/noUnusedVariables: tsc-checked assertions
function _coverage() {
	// full coverage compiles, and each intent is narrowed to its kind
	const full: Interpreters<BuiltinIntent, A> = {
		query: (intent) => {
			const _key: readonly unknown[] = intent.key; // intent is QueryIntent
			intent.onData([]);
			void _key;
		},
		timeout: (intent) => {
			const _ms: number = intent.ms; // intent is TimeoutIntent
			void _ms;
		},
		storageSet: (intent) => {
			const _v: unknown = intent.value; // intent is StorageSetIntent
			void _v;
		},
	};
	void full;

	// @ts-expect-error missing 'storageSet' interpreter → not assignable
	const partial: Interpreters<BuiltinIntent, A> = {
		query: () => {},
		timeout: () => {},
	};
	void partial;
}

describe("M2 — interpreter coverage typing", () => {
	it("requires an interpreter for every intent kind (enforced by tsc)", () => {
		expect(typeof _coverage).toBe("function");
	});
});
