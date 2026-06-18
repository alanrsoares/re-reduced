/**
 * re-reduced v2 spike — union-registry core.
 *
 * Goal: prove full payload inference + an exhaustive action union with ZERO
 * `any` in stored/constraint positions. The v1 wall was
 * `Tree<ActionCreator<any>>`: a heterogeneous collection of action-creators
 * could only be constrained with `any` because the call signature is
 * contravariant in the payload.
 *
 * The trick here: store each handler as a METHOD (`reduce(state, payload)`).
 * Method parameters are bivariant under strictFunctionTypes, so
 * `ActionSpec<S, number>` IS assignable to `ActionSpec<S, unknown>` — which
 * lets the generic constraint be `Record<string, ActionSpec<S, unknown>>`
 * while every concrete payload type still flows through for inference.
 */

/** Action shape — payload key vanishes for void-payload actions. */
export type Action<T extends string, P> = [P] extends [void]
	? { readonly type: T }
	: { readonly type: T; readonly payload: P };

/** A single handler spec. `reduce` is a METHOD on purpose (bivariance). */
export interface ActionSpec<S, P> {
	reduce(state: S, payload: P): S;
}

/** The `on` builder handed to `createSlice`. */
export type OnBuilder<S> = <P = void>(
	reduce: (state: S, payload: P) => S,
) => ActionSpec<S, P>;

/** Extract the payload type from a spec (match-position any is local-only). */
type PayloadOf<Sp> = Sp extends ActionSpec<any, infer P> ? P : never;

/** void payload -> no argument; otherwise a single named payload argument. */
type Args<P> = [P] extends [void] ? [] : [payload: P];

/** Inferred action-creator map. */
export type Actions<Name extends string, R> = {
	[K in keyof R & string]: (
		...args: Args<PayloadOf<R[K]>>
	) => Action<`${Name}/${K}`, PayloadOf<R[K]>>;
};

/** Discriminated union of every action the slice can produce. */
export type ActionUnion<Name extends string, R> = {
	[K in keyof R & string]: Action<`${Name}/${K}`, PayloadOf<R[K]>>;
}[keyof R & string];

export interface Slice<Name extends string, S, R> {
	readonly name: Name;
	readonly initialState: S;
	readonly actions: Actions<Name, R>;
	reducer(state: S | undefined, action: ActionUnion<Name, R>): S;
}

export function createSlice<
	const Name extends string,
	S,
	R extends Record<string, ActionSpec<S, unknown>>,
>(name: Name, initialState: S, build: (on: OnBuilder<S>) => R): Slice<Name, S, R> {
	const on: OnBuilder<S> = (reduce) => ({ reduce });
	const specs = build(on);

	const actions = Object.fromEntries(
		Object.keys(specs).map((key) => {
			const type = `${name}/${key}`;
			const creator = (payload?: unknown) =>
				payload === undefined ? { type } : { type, payload };
			(creator as unknown as { type: string }).type = type;
			return [key, creator];
		}),
	) as Actions<Name, R>;

	const reducer = (
		state: S = initialState,
		action: ActionUnion<Name, R>,
	): S => {
		const key = action.type.slice(name.length + 1);
		const spec = specs[key];
		return spec
			? spec.reduce(state, (action as { payload?: unknown }).payload)
			: state;
	};

	return { name, initialState, actions, reducer };
}
