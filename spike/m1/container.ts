/**
 * @re-reduced/core (spike) — createContainer.
 *
 * - per-field signals + shallow-diff dispatch (ADR-0002)
 * - transitions are pure (state, payload) => state (ADR-0003)
 * - derivations are auto-tracked computed (ADR-0002)
 *
 * Action-registry inference reuses the method-bivariance trick proven in
 * spike/v2-core (lets `Record<string, ActionSpec<S, unknown>>` accept concrete
 * payload types with zero `any`).
 */
import { batch, computed, type ReadSignal, signal, type WriteSignal } from "./signals";

/** Handler stored as a METHOD → bivariant params → satisfies the unknown-constraint. */
export interface ActionSpec<S, P> {
	reduce(state: S, payload: P): S;
}
export type OnBuilder<S> = <P = void>(
	reduce: (state: S, payload: P) => S,
) => ActionSpec<S, P>;

type PayloadOf<Sp> = Sp extends ActionSpec<any, infer P> ? P : never;
/** void OR unknown payload (an action whose handler ignores the payload) → nullary. */
type IsVoid<P> = [P] extends [void] ? true : unknown extends P ? true : false;
type Args<P> = IsVoid<P> extends true ? [] : [payload: P];

export type Actions<R> = {
	[K in keyof R & string]: (...args: Args<PayloadOf<R[K]>>) => void;
};

/** State exposed to derivations as per-field signals (so reads auto-track). */
export type StateSignals<S> = { readonly [K in keyof S]: ReadSignal<S[K]> };
export type DerivedSignals<D> = {
	readonly [K in keyof D]: D[K] extends () => infer T ? ReadSignal<T> : never;
};

export interface ContainerDef<S, R, D extends Record<string, () => unknown>> {
	state: S;
	actions: (on: OnBuilder<S>) => R;
	derive?: (state: StateSignals<S>) => D;
}

export interface Store<S, R, D extends Record<string, () => unknown>> {
	readonly $state: StateSignals<S>;
	readonly $derived: DerivedSignals<D>;
	readonly actions: Actions<R>;
	getState(): S;
	/** Build a memoized, auto-tracking selector signal (the adapter read primitive). */
	select<T>(sel: (s: StateSignals<S>, d: DerivedSignals<D>) => T): ReadSignal<T>;
	destroy(): void;
}

export function defineContainer<
	S extends Record<string, unknown>,
	R extends Record<string, ActionSpec<S, unknown>>,
	D extends Record<string, () => unknown> = Record<string, never>,
>(name: string, def: ContainerDef<S, R, D>): ContainerDef<S, R, D> & { name: string } {
	return { name, ...def };
}

export function createContainer<
	S extends Record<string, unknown>,
	R extends Record<string, ActionSpec<S, unknown>>,
	D extends Record<string, () => unknown>,
>(def: ContainerDef<S, R, D>, init?: Partial<S>): Store<S, R, D> {
	const initial = { ...def.state, ...init };

	const $state = {} as Record<string, WriteSignal<unknown>>;
	for (const key of Object.keys(initial)) $state[key] = signal(initial[key]);

	const snapshot = (): S => {
		const out = {} as Record<string, unknown>;
		for (const key of Object.keys($state)) out[key] = $state[key].peek();
		return out as S;
	};

	const specs = def.actions(((reduce) => ({ reduce })) as OnBuilder<S>);
	const actions = {} as Record<string, (payload?: unknown) => void>;
	for (const key of Object.keys(specs)) {
		actions[key] = (payload?: unknown) => {
			const prev = snapshot();
			const next = specs[key].reduce(prev, payload) as Record<string, unknown>;
			batch(() => {
				for (const k of Object.keys(next)) {
					if (!Object.is(next[k], (prev as Record<string, unknown>)[k])) {
						$state[k].value = next[k];
					}
				}
			});
		};
	}

	const $derived = {} as Record<string, ReadSignal<unknown>>;
	if (def.derive) {
		const builders = def.derive($state as StateSignals<S>);
		for (const key of Object.keys(builders)) {
			$derived[key] = computed(builders[key]);
		}
	}

	return {
		$state: $state as StateSignals<S>,
		$derived: $derived as DerivedSignals<D>,
		actions: actions as unknown as Actions<R>,
		getState: snapshot,
		select: (sel) => computed(() => sel($state as StateSignals<S>, $derived as DerivedSignals<D>)),
		destroy: () => {
			/* spike: real impl stops effects / aborts intent signals */
		},
	};
}
