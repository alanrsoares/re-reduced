/**
 * @re-reduced/signals façade (spike) — ADR-0001.
 *
 * Core/adapters program against THIS, never the engine directly, so the engine
 * is swappable. Default engine: @preact/signals-core.
 */
import {
	batch as _batch,
	computed as _computed,
	effect as _effect,
	signal as _signal,
} from "@preact/signals-core";

export interface ReadSignal<T> {
	readonly value: T;
	peek(): T;
	subscribe(run: (value: T) => void): () => void;
}
export interface WriteSignal<T> extends ReadSignal<T> {
	value: T;
}

export const signal = <T>(value: T): WriteSignal<T> => _signal(value);
export const computed = <T>(fn: () => T): ReadSignal<T> => _computed(fn);
export const effect = (fn: () => void | (() => void)): (() => void) => _effect(fn);
export const batch = <T>(fn: () => T): T => _batch(fn);
