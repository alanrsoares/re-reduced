import { afterEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import { createContainerContext, useSelect } from "@re-reduced/react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createContext, useContext, useReducer } from "react";
import { create } from "zustand";

/**
 * Render-count on a PARTIAL update: state has { a, b }; one LEAF reads `a`,
 * another reads `b`; bump `a` and measure which leaves re-render (delta from
 * the post-mount baseline). The selecting hook lives in each leaf — that's what
 * enables per-component bail-out.
 *
 * re-reduced and Zustand both bail out (only the `a` leaf re-renders). A naive
 * useReducer + Context broadcasts, so every consumer re-renders.
 */
const counts = { a: 0, b: 0 };
afterEach(cleanup);

describe("partial-update render count", () => {
  it("re-reduced: only the changed slice's leaf re-renders", () => {
    const Ctx = createContainerContext(
      defineContainer("c", {
        state: { a: 0, b: 0 },
        actions: (on) => ({ bumpA: on((s) => ({ ...s, a: s.a + 1 })) }),
      }),
    );
    const LeafA = () => {
      counts.a += 1;
      return <span>{useSelect(Ctx.use(), (s) => s.a.value)}</span>;
    };
    const LeafB = () => {
      counts.b += 1;
      return <span>{useSelect(Ctx.use(), (s) => s.b.value)}</span>;
    };
    function Go() {
      const store = Ctx.use();
      return (
        <button
          type="button"
          data-testid="go"
          onClick={() => store.actions.bumpA()}
        >
          go
        </button>
      );
    }
    render(
      <Ctx.Provider>
        <LeafA />
        <LeafB />
        <Go />
      </Ctx.Provider>,
    );
    const base = { ...counts };
    fireEvent.click(screen.getByTestId("go"));
    expect(counts.a - base.a).toBe(1); // a leaf re-rendered
    expect(counts.b - base.b).toBe(0); // b leaf bailed out
  });

  it("zustand: same fine-grained bail-out", () => {
    const useStore = create<{ a: number; b: number; bumpA: () => void }>(
      (set) => ({
        a: 0,
        b: 0,
        bumpA: () => set((s) => ({ a: s.a + 1 })),
      }),
    );
    const LeafA = () => {
      counts.a += 1;
      return <span>{useStore((s) => s.a)}</span>;
    };
    const LeafB = () => {
      counts.b += 1;
      return <span>{useStore((s) => s.b)}</span>;
    };
    function App() {
      return (
        <>
          <LeafA />
          <LeafB />
          <button
            type="button"
            data-testid="go"
            onClick={() => useStore.getState().bumpA()}
          >
            go
          </button>
        </>
      );
    }
    render(<App />);
    const base = { ...counts };
    fireEvent.click(screen.getByTestId("go"));
    expect(counts.a - base.a).toBe(1);
    expect(counts.b - base.b).toBe(0);
  });

  it("useReducer + Context: every consumer re-renders (no bail-out)", () => {
    const Ctx = createContext<{ a: number; b: number }>({ a: 0, b: 0 });
    const LeafA = () => {
      counts.a += 1;
      return <span>{useContext(Ctx).a}</span>;
    };
    const LeafB = () => {
      counts.b += 1;
      return <span>{useContext(Ctx).b}</span>;
    };
    function App() {
      const [state, dispatch] = useReducer(
        (s: { a: number; b: number }) => ({ ...s, a: s.a + 1 }),
        { a: 0, b: 0 },
      );
      return (
        <Ctx.Provider value={state}>
          <LeafA />
          <LeafB />
          <button type="button" data-testid="go" onClick={() => dispatch()}>
            go
          </button>
        </Ctx.Provider>
      );
    }
    render(<App />);
    const base = { ...counts };
    fireEvent.click(screen.getByTestId("go"));
    expect(counts.a - base.a).toBe(1);
    expect(counts.b - base.b).toBe(1); // b re-renders too — context has no selector
  });
});
