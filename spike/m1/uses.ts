/**
 * Render-count harness modeling React's `useSyncExternalStore` contract.
 *
 * uSES re-renders a component iff `getSnapshot()` returns a value `!==` the
 * previous one. With @preact/signals-core, a `computed` selector notifies
 * subscribers ONLY when its value actually changes — which is exactly that
 * bail-out. So counting selector-computed notifications (excluding the initial
 * mount) faithfully counts the re-renders React would perform.
 *
 * This is what `@re-reduced/react`'s `useSelect` reduces to:
 *   useSyncExternalStore(c.subscribe, () => c.peek())
 */
import type { DerivedSignals, StateSignals, Store } from "./container";

export interface MountedSelector<T> {
	/** Re-renders React would perform (snapshot changes), excluding initial mount. */
	readonly renders: number;
	value(): T;
	unmount(): void;
}

export function mountSelector<
	S extends Record<string, unknown>,
	// biome-ignore lint/suspicious/noExplicitAny: spike harness over any store shape
	R extends Record<string, any>,
	D extends Record<string, () => unknown>,
	T,
>(
	store: Store<S, R, D>,
	sel: (s: StateSignals<S>, d: DerivedSignals<D>) => T,
): MountedSelector<T> {
	const c = store.select(sel);
	let renders = 0;
	let first = true;
	let current = c.peek();
	const unsubscribe = c.subscribe((value) => {
		if (first) {
			first = false; // initial synchronous emit = mount, not a re-render
			return;
		}
		current = value;
		renders += 1;
	});
	return {
		get renders() {
			return renders;
		},
		value: () => current,
		unmount: unsubscribe,
	};
}
