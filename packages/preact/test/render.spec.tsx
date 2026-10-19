/** @jsxImportSource preact */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { defineContainer, shallow } from "@re-reduced/core";
import { act, cleanup, fireEvent, render } from "@testing-library/preact";
import { createContainerContext, useSelect } from "../src";

const todos = defineContainer("todos", {
  state: { draft: "", items: [] as string[] },
  actions: (on) => ({
    draftChanged: on<string>((s, draft) => ({ ...s, draft })),
    addItem: on<string>((s, item) => ({ ...s, items: [...s.items, item] })),
  }),
});

const Ctx = createContainerContext(todos);
const counts = { draft: 0, list: 0, controls: 0 };

function DraftInput() {
  const store = Ctx.use();
  const draft = useSelect(store, (s) => s.draft.value);
  counts.draft += 1;
  return (
    <input
      data-testid="input"
      value={draft}
      onInput={(e) =>
        store.actions.draftChanged((e.target as HTMLInputElement).value)
      }
    />
  );
}

function List() {
  const store = Ctx.use();
  const items = useSelect(store, (s) => s.items.value);
  counts.list += 1;
  return (
    <ul data-testid="list">
      {items.map((it, i) => (
        <li key={`${i}-${it}`}>{it}</li>
      ))}
    </ul>
  );
}

function Controls() {
  const store = Ctx.use();
  counts.controls += 1; // subscribes to nothing → should never re-render
  return (
    <button
      type="button"
      data-testid="add"
      onClick={() => store.actions.addItem("x")}
    >
      add
    </button>
  );
}

const App = () => (
  <Ctx.Provider>
    <DraftInput />
    <List />
    <Controls />
  </Ctx.Provider>
);

describe("@re-reduced/preact — fine-grained re-renders (real DOM)", () => {
  beforeEach(() => {
    counts.draft = 0;
    counts.list = 0;
    counts.controls = 0;
  });
  afterEach(cleanup);

  it("a draft keystroke re-renders only the input", () => {
    const { getByTestId } = render(<App />);
    const baseline = { ...counts };

    fireEvent.input(getByTestId("input"), { target: { value: "a" } });

    expect(counts.draft).toBe(baseline.draft + 1);
    expect(counts.list).toBe(baseline.list);
    expect(counts.controls).toBe(baseline.controls);
  });

  it("adding an item re-renders only the list", () => {
    const { getByTestId } = render(<App />);
    const baseline = { ...counts };

    fireEvent.click(getByTestId("add"));

    expect(counts.list).toBe(baseline.list + 1);
    expect(counts.draft).toBe(baseline.draft);
    expect(counts.controls).toBe(baseline.controls);
    expect(getByTestId("list").querySelectorAll("li").length).toBe(1);
  });
});

describe("useSelect equals", () => {
  const pair = defineContainer("pair", {
    state: { a: 0, other: 0 },
    actions: (on) => ({
      bumpOther: on((s) => ({ other: s.other + 1 })),
      bumpA: on((s) => ({ a: s.a + 1 })),
    }),
  });
  const PairCtx = createContainerContext(pair);

  const run = (equals?: (a: unknown, b: unknown) => boolean) => {
    let renders = 0;
    let actions!: ReturnType<typeof PairCtx.use>["actions"];
    function Reader() {
      const store = PairCtx.use();
      actions = store.actions;
      useSelect(store, (s) => ({ half: Math.floor(s.a.value / 2) }), equals);
      renders += 1;
      return null;
    }
    render(
      <PairCtx.Provider>
        <Reader />
      </PairCtx.Provider>,
    );
    return { actions, renders: () => renders };
  };

  afterEach(cleanup);

  it("without equals, a new object re-renders", () => {
    const r = run();
    const before = r.renders();
    act(() => r.actions.bumpA()); // half stays 0, object is new
    expect(r.renders()).toBeGreaterThan(before);
  });

  it("with shallow, an equal selection does not re-render", () => {
    const r = run(shallow as (a: unknown, b: unknown) => boolean);
    const before = r.renders();
    act(() => r.actions.bumpA()); // a: 1, half stays 0
    expect(r.renders()).toBe(before);
    act(() => r.actions.bumpA()); // a: 2, half becomes 1
    expect(r.renders()).toBe(before + 1);
  });
});
