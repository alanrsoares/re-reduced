import { afterEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Suspense, use, useTransition } from "react";
import { createContainerContext, useSelect } from "../src";

const counter = defineContainer("c", {
  state: { n: 0 },
  actions: (on) => ({ inc: on((s) => ({ ...s, n: s.n + 1 })) }),
});
const Ctx = createContainerContext(counter);

describe("@re-reduced/react — concurrent features", () => {
  afterEach(cleanup);

  it("an update dispatched inside a transition applies (uSES is tearing-safe)", async () => {
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
    // the transition commits asynchronously — poll until it flushes (no tearing)
    expect(await screen.findByText("n=1")).toBeTruthy();
  });

  it("the store stays alive and functional across a sibling suspend/resume", async () => {
    let resolve!: () => void;
    const gate = new Promise<void>((r) => {
      resolve = r;
    });

    function Suspender() {
      use(gate);
      return <span data-testid="loaded">loaded</span>;
    }
    let store: ReturnType<typeof Ctx.use> | undefined;
    function Capture() {
      store = Ctx.use();
      return null;
    }

    // Render then resolve within the same awaited act, so the boundary is not
    // left suspended when act exits (avoids the "suspended, not awaited" warning).
    await act(async () => {
      render(
        <Ctx.Provider>
          <Suspense fallback={<span data-testid="fb">…</span>}>
            <Suspender />
          </Suspense>
          <Capture />
        </Ctx.Provider>,
      );
      resolve();
      await gate;
    });

    // Capture (outside the boundary) committed → store available and alive.
    expect(store?.destroyed).toBe(false);
    expect(store?.getState().n).toBe(0);
    store?.actions.inc();
    expect(store?.getState().n).toBe(1);
  });
});
