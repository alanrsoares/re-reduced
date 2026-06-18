import { afterEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Suspense, use, useTransition } from "react";
import { createContainerContext, useSelect } from "../src";

const counter = defineContainer()("c", {
	state: { n: 0 },
	actions: (on) => ({ inc: on((s) => ({ ...s, n: s.n + 1 })) }),
});
const Ctx = createContainerContext(counter);

describe("@re-reduced/react — concurrent features", () => {
	afterEach(cleanup);

	it("an update dispatched inside a transition applies (uSES is tearing-safe)", () => {
		function View() {
			const store = Ctx.use();
			const n = useSelect(store, (s) => s.n.value);
			const [, startTransition] = useTransition();
			return (
				<button
					type="button"
					data-testid="b"
					onClick={() => startTransition(() => store.actions.inc())}
				>
					n={n}
				</button>
			);
		}
		render(
			<Ctx.Provider>
				<View />
			</Ctx.Provider>,
		);
		expect(screen.getByTestId("b").textContent).toBe("n=0");
		fireEvent.click(screen.getByTestId("b"));
		expect(screen.getByTestId("b").textContent).toBe("n=1");
	});

	it("the store stays alive and functional while a sibling subtree is suspended", () => {
		const gate = new Promise<void>(() => {}); // never resolves → boundary stays suspended
		let store: ReturnType<typeof Ctx.use> | undefined;

		function Suspender() {
			use(gate);
			return null;
		}
		function Capture() {
			store = Ctx.use();
			const n = useSelect(store, (s) => s.n.value);
			return <span data-testid="v">{n}</span>;
		}

		render(
			<Ctx.Provider>
				<Suspense fallback={<span data-testid="fb">…</span>}>
					<Suspender />
				</Suspense>
				<Capture />
			</Ctx.Provider>,
		);

		// sibling suspended → fallback shown; the outside reader rendered initial state
		expect(screen.getByTestId("fb")).toBeTruthy();
		expect(screen.getByTestId("v").textContent).toBe("0");

		// the store is alive and fully functional despite the suspended sibling
		expect(store?.destroyed).toBe(false);
		expect(store?.getState().n).toBe(0);
		store?.actions.inc();
		expect(store?.getState().n).toBe(1);
	});
});
