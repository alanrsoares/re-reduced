/**
 * Core (renderer-agnostic) interpreters — ADR-0006: timeout, storage.
 * The server bridge (query/mutate) lives in the adapter layer, not here.
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
	setItem(key: string, value: string): void;
}

/** Defaults to globalThis.localStorage; inject a backend for tests/SSR. */
export const makeStorageInterpreter =
	<A>(
		backend: StorageBackend | undefined = (
			globalThis as { localStorage?: StorageBackend }
		).localStorage,
	) =>
	(intent: StorageSetIntent, _ctx: InterpCtx<A>): void => {
		backend?.setItem(intent.key, JSON.stringify(intent.value));
	};
