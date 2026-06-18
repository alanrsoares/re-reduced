/**
 * @re-reduced/core — the container.
 *
 * - per-field signals + shallow-diff dispatch (ADR-0002)
 * - pure transitions (state, payload) => state (ADR-0003)
 * - auto-tracked computed derivations (ADR-0002)
 * - reactions block emitting effect intents (ADR-0004/0005)
 * - intent dispatcher routing by kind to registered interpreters (ADR-0006)
 *
 * Action-registry inference uses method bivariance so a
 * `Record<string, ActionSpec<S, unknown>>` constraint accepts concrete payload
 * types with zero `any` (the v1 wall).
 */
import {
	batch,
	computed,
	effect,
	type ReadSignal,
	signal,
	type WriteSignal,
} from "@re-reduced/signals";

// ── action registry ──
/** Handler stored as a METHOD → bivariant params → satisfies the unknown-constraint. */
export interface ActionSpec<S, P> {
	reduce(state: S, payload: P): S;
}
export type OnBuilder<S> = <P = void>(
	reduce: (state: S, payload: P) => S,
) => ActionSpec<S, P>;

type PayloadOf<Sp> = Sp extends ActionSpec<any, infer P> ? P : never;
/** void OR unknown payload (handler ignores payload) → nullary creator. */
type IsVoid<P> = [P] extends [void] ? true : unknown extends P ? true : false;
type Args<P> = IsVoid<P> extends true ? [] : [payload: P];

export type Actions<R> = {
	[K in keyof R & string]: (...args: Args<PayloadOf<R[K]>>) => void;
};
export type StateSignals<S> = { readonly [K in keyof S]: ReadSignal<S[K]> };
export type DerivedSignals<D> = {
	readonly [K in keyof D]: D[K] extends () => infer T ? ReadSignal<T> : never;
};

// ── intents / interpreters (ADR-0006) ──
export interface InterpCtx<A> {
	readonly actions: A;
	readonly signal: AbortSignal;
}
export type Interpreter<I, A> = (
	intent: I,
	ctx: InterpCtx<A>,
) => void | (() => void);
/** Typed coverage: a registry MUST supply an interpreter for every intent kind. */
export type Interpreters<I extends { kind: string }, A> = {
	[K in I["kind"]]: Interpreter<Extract<I, { kind: K }>, A>;
};

// ── reactions (ADR-0005) ──
export interface ReactionCtx<S, A> {
	getState(): S;
	readonly actions: A;
}
type Emit<I> = I | I[] | void;
export interface EffectBuilder<S, ActionName extends string, A, I> {
	onAction(
		name: ActionName,
		handler: (payload: unknown, ctx: ReactionCtx<S, A>) => Emit<I>,
	): void;
	onChange<T>(
		select: (s: StateSignals<S>) => T,
		handler: (value: T, prev: T, ctx: ReactionCtx<S, A>) => Emit<I>,
	): void;
	/** Fires when `predicate` transitions into true (and once at mount if already true). */
	onEnter(
		predicate: (s: StateSignals<S>) => boolean,
		handler: (ctx: ReactionCtx<S, A>) => Emit<I>,
	): void;
}

export interface ContainerDef<
	S,
	R,
	D extends Record<string, () => unknown>,
	I extends { kind: string },
> {
	state: S;
	actions: (on: OnBuilder<S>) => R;
	derive?: (state: StateSignals<S>) => D;
	effects?: (fx: EffectBuilder<S, keyof R & string, Actions<R>, I>) => void;
}

export interface Store<S, R, D extends Record<string, () => unknown>> {
	readonly $state: StateSignals<S>;
	readonly $derived: DerivedSignals<D>;
	readonly actions: Actions<R>;
	getState(): S;
	select<T>(
		sel: (s: StateSignals<S>, d: DerivedSignals<D>) => T,
	): ReadSignal<T>;
	destroy(): void;
}

/**
 * Curried so the intent union `I` is given explicitly while `S`/`R`/`D` are
 * inferred from the definition body: `defineContainer<MyIntent>()("name", {...})`.
 */
export function defineContainer<I extends { kind: string } = never>() {
	return <
		S extends Record<string, unknown>,
		R extends Record<string, ActionSpec<S, unknown>>,
		D extends Record<string, () => unknown> = Record<string, never>,
	>(
		name: string,
		def: ContainerDef<S, R, D, I>,
	): ContainerDef<S, R, D, I> & { name: string } => ({ name, ...def });
}

export function createContainer<
	S extends Record<string, unknown>,
	R extends Record<string, ActionSpec<S, unknown>>,
	D extends Record<string, () => unknown>,
	I extends { kind: string },
>(
	def: ContainerDef<S, R, D, I>,
	opts?: { interpreters?: Interpreters<I, Actions<R>>; init?: Partial<S> },
): Store<S, R, D> {
	const initial = { ...def.state, ...opts?.init };
	const controller = new AbortController();
	const cleanups: Array<() => void> = [];

	const $state = {} as Record<string, WriteSignal<unknown>>;
	for (const key of Object.keys(initial)) $state[key] = signal(initial[key]);

	const snapshot = (): S => {
		const out = {} as Record<string, unknown>;
		for (const key of Object.keys($state)) out[key] = $state[key].peek();
		return out as S;
	};

	const interpreters = (opts?.interpreters ?? {}) as unknown as Record<
		string,
		Interpreter<I, Actions<R>>
	>;
	const runIntent = (intent: I) => {
		const interpret = interpreters[intent.kind];
		if (!interpret)
			throw new Error(`no interpreter for intent kind "${intent.kind}"`);
		const cleanup = interpret(intent, {
			actions: api.actions,
			signal: controller.signal,
		});
		if (cleanup) cleanups.push(cleanup);
	};
	const dispatchIntents = (result: Emit<I>) => {
		if (!result) return;
		for (const i of Array.isArray(result) ? result : [result]) runIntent(i);
	};

	const actionListeners = new Set<(name: string, payload: unknown) => void>();
	const specs = def.actions(((reduce) => ({ reduce })) as OnBuilder<S>);
	const actions = {} as Record<string, (payload?: unknown) => void>;
	for (const key of Object.keys(specs)) {
		actions[key] = (payload?: unknown) => {
			const prev = snapshot();
			const next = specs[key].reduce(prev, payload) as Record<string, unknown>;
			batch(() => {
				for (const k of Object.keys(next)) {
					if (!Object.is(next[k], (prev as Record<string, unknown>)[k]))
						$state[k].value = next[k];
				}
			});
			for (const fn of actionListeners) fn(key, payload); // committed → notify (ADR-0005)
		};
	}

	const $derived = {} as Record<string, ReadSignal<unknown>>;
	if (def.derive) {
		const builders = def.derive($state as StateSignals<S>);
		for (const key of Object.keys(builders))
			$derived[key] = computed(builders[key]);
	}

	const api: Store<S, R, D> = {
		$state: $state as StateSignals<S>,
		$derived: $derived as DerivedSignals<D>,
		actions: actions as unknown as Actions<R>,
		getState: snapshot,
		select: (sel) =>
			computed(() =>
				sel($state as StateSignals<S>, $derived as DerivedSignals<D>),
			),
		destroy: () => {
			controller.abort();
			for (const fn of cleanups.splice(0)) fn();
			actionListeners.clear();
		},
	};

	if (def.effects) {
		const ctx: ReactionCtx<S, Actions<R>> = {
			getState: snapshot,
			actions: api.actions,
		};
		const fx: EffectBuilder<S, keyof R & string, Actions<R>, I> = {
			onAction: (name, handler) => {
				const listener = (firedName: string, payload: unknown) => {
					if (firedName === name) dispatchIntents(handler(payload, ctx));
				};
				actionListeners.add(listener);
				cleanups.push(() => actionListeners.delete(listener));
			},
			onChange: (select, handler) => {
				let prev: unknown;
				let first = true;
				cleanups.push(
					effect(() => {
						const value = select($state as StateSignals<S>);
						if (first) {
							first = false;
							prev = value;
							return;
						}
						if (!Object.is(value, prev)) {
							const before = prev;
							prev = value;
							dispatchIntents(handler(value as never, before as never, ctx));
						}
					}),
				);
			},
			onEnter: (predicate, handler) => {
				let was = false;
				cleanups.push(
					effect(() => {
						const now = predicate($state as StateSignals<S>);
						if (now && !was) dispatchIntents(handler(ctx));
						was = now;
					}),
				);
			},
		};
		def.effects(fx);
	}

	return api;
}
