import type { ActionSpec, ContainerDef, Store } from "@re-reduced/core";
import { type ComponentChildren, createContext, h } from "preact";
import { useContext } from "preact/hooks";
import { type UseContainerOptions, useContainer } from "./hooks";

/** Lift a Container to a subtree (selector bail-out preserved via signals). */
export function createContainerContext<
	S extends Record<string, unknown>,
	R extends Record<string, ActionSpec<S, unknown>>,
	D extends Record<string, () => unknown>,
	I extends { kind: string },
>(def: ContainerDef<S, R, D, I>, baseOpts?: UseContainerOptions<S, R, I>) {
	const Ctx = createContext<Store<S, R, D> | null>(null);

	function Provider(props: { children: ComponentChildren; init?: Partial<S> }) {
		const store = useContainer(def, {
			...baseOpts,
			init: props.init ?? baseOpts?.init,
		});
		return h(Ctx.Provider, { value: store }, props.children);
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
