import type { ActionSpec, ContainerDef, Store } from "@re-reduced/core";
import {
	createContext,
	createElement,
	type ReactNode,
	useContext,
} from "react";
import { type UseContainerOptions, useContainer } from "./hooks";

/**
 * Lift a Container to a subtree. Reads still go through `useSelect` (signals),
 * so selector bail-out is preserved — unlike raw Context value broadcast.
 */
export function createContainerContext<
	S extends Record<string, unknown>,
	R extends Record<string, ActionSpec<S, unknown>>,
	D extends Record<string, () => unknown>,
	I extends { kind: string },
>(def: ContainerDef<S, R, D, I>, baseOpts?: UseContainerOptions<S, R, I>) {
	const Ctx = createContext<Store<S, R, D> | null>(null);

	function Provider(props: { children: ReactNode; init?: Partial<S> }) {
		const store = useContainer(def, {
			...baseOpts,
			init: props.init ?? baseOpts?.init,
		});
		return createElement(Ctx.Provider, { value: store }, props.children);
	}

	function useStore(): Store<S, R, D> {
		const store = useContext(Ctx);
		if (!store)
			throw new Error(
				`Container "${(def as { name?: string }).name ?? "?"}" has no Provider above`,
			);
		return store;
	}

	return { Provider, use: useStore, Context: Ctx };
}
