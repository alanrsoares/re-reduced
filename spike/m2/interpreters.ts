/**
 * Core interpreters (spike) — renderer-agnostic (ADR-0006): timeout, storage.
 * The server bridge (query/mutate) lives in the adapter-kit, not here.
 */
import type { InterpCtx } from "./container";
import type { StorageSetIntent, TimeoutIntent } from "./intents";

export const timeoutInterpreter = <A>(
	intent: TimeoutIntent,
	{ signal }: InterpCtx<A>,
): (() => void) => {
	const id = setTimeout(() => {
		if (!signal.aborted) intent.run();
	}, intent.ms);
	return () => clearTimeout(id);
};

export interface StorageBackend {
	set(key: string, value: unknown): void;
}
export const makeStorageInterpreter =
	<A>(backend: StorageBackend) =>
	(intent: StorageSetIntent, _ctx: InterpCtx<A>): void => {
		backend.set(intent.key, intent.value);
	};
