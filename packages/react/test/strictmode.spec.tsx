import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { StrictMode } from "react";
import { createContainerContext, useSelect } from "../src";

let interpreterCalls = 0;

const def = defineContainer<{ kind: "ping" }>()("sm", {
	state: { n: 0 },
	actions: (on) => ({
		trigger: on((s) => ({ ...s, n: s.n + 1 })),
	}),
	effects: (fx) => {
		fx.onAction("trigger", () => ({ kind: "ping" as const }));
	},
});

const Ctx = createContainerContext(def, {
	interpreters: {
		ping: () => {
			interpreterCalls += 1;
		},
	},
});

function View() {
	const store = Ctx.use();
	const n = useSelect(store, (s) => s.n.value);
	return (
		<button
			type="button"
			data-testid="trigger"
			onClick={() => store.actions.trigger()}
		>
			{n}
		</button>
	);
}

const App = () => (
	<StrictMode>
		<Ctx.Provider>
			<View />
		</Ctx.Provider>
	</StrictMode>
);

describe("@re-reduced/react — StrictMode resilience", () => {
	beforeEach(() => {
		interpreterCalls = 0;
	});
	afterEach(cleanup);

	it("survives the mount/unmount/mount cycle: store stays alive, reaction fires once", () => {
		const { getByTestId } = render(<App />);

		// no spurious effect just from mounting (even with the StrictMode double-invoke)
		expect(interpreterCalls).toBe(0);

		fireEvent.click(getByTestId("trigger"));

		// state updated → the store the UI holds is alive (not the destroyed one)
		expect(getByTestId("trigger").textContent).toBe("1");
		// reaction fired exactly once — not doubled by StrictMode, not dead
		expect(interpreterCalls).toBe(1);
	});

	it("a second dispatch fires the reaction again, exactly once", () => {
		const { getByTestId } = render(<App />);
		fireEvent.click(getByTestId("trigger"));
		fireEvent.click(getByTestId("trigger"));
		expect(getByTestId("trigger").textContent).toBe("2");
		expect(interpreterCalls).toBe(2);
	});
});
