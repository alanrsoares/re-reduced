/**
 * Effect intents (spike) — ADR-0004/0006.
 *
 * Tagged unions. Constructors build descriptors; reactions return them; the
 * interpreter registered for each `kind` executes them. The result of I/O
 * flows back via the descriptor's callbacks, which close over the reaction's
 * `actions` — so results re-enter as actions (the SSOT discipline).
 */

export interface QueryIntent {
	readonly kind: "query";
	readonly key: readonly unknown[];
	readonly run: (signal: AbortSignal) => Promise<unknown>;
	readonly onData: (data: unknown) => void;
	readonly onError?: (error: unknown) => void;
}

export interface TimeoutIntent {
	readonly kind: "timeout";
	readonly ms: number;
	readonly run: () => void;
}

export interface StorageSetIntent {
	readonly kind: "storageSet";
	readonly key: string;
	readonly value: unknown;
}

/** The built-in intent vocabulary for this spike. Users extend the union. */
export type BuiltinIntent = QueryIntent | TimeoutIntent | StorageSetIntent;

export const query = <T>(spec: {
	key: readonly unknown[];
	run: (signal: AbortSignal) => Promise<T>;
	onData: (data: T) => void;
	onError?: (error: unknown) => void;
}): QueryIntent => ({
	kind: "query",
	key: spec.key,
	run: spec.run as (signal: AbortSignal) => Promise<unknown>,
	onData: spec.onData as (data: unknown) => void,
	onError: spec.onError,
});

export const timeout = (ms: number, run: () => void): TimeoutIntent => ({
	kind: "timeout",
	ms,
	run,
});

export const storageSet = (key: string, value: unknown): StorageSetIntent => ({
	kind: "storageSet",
	key,
	value,
});
