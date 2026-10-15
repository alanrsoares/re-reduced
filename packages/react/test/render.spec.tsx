import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { defineContainer, shallow } from "@re-reduced/core";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
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
      onChange={(e) => store.actions.draftChanged(e.target.value)}
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
        // biome-ignore lint/suspicious/noArrayIndexKey: test fixture
        <li key={i}>{it}</li>
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

describe("@re-reduced/react — fine-grained re-renders (real DOM)", () => {
  beforeEach(() => {
    counts.draft = 0;
    counts.list = 0;
    counts.controls = 0;
  });
  afterEach(cleanup);

  it("a draft keystroke re-renders only the input, not the list or controls", () => {
    const { getByTestId } = render(<App />);
    const baseline = { ...counts };

    fireEvent.change(getByTestId("input"), { target: { value: "a" } });

    expect(counts.draft).toBe(baseline.draft + 1); // input re-rendered
    expect(counts.list).toBe(baseline.list); // list did NOT
    expect(counts.controls).toBe(baseline.controls); // controls did NOT
    expect((getByTestId("input") as HTMLInputElement).value).toBe("a");
  });

  it("adding an item re-renders only the list", () => {
    const { getByTestId } = render(<App />);
    const baseline = { ...counts };

    fireEvent.click(getByTestId("add"));

    expect(counts.list).toBe(baseline.list + 1); // list re-rendered
    expect(counts.draft).toBe(baseline.draft); // input did NOT
    expect(counts.controls).toBe(baseline.controls); // controls did NOT
    expect(getByTestId("list").querySelectorAll("li").length).toBe(1);
  });
});

describe("useSelect equals", () => {
  const pair = defineContainer("pair", {
    state: { a: 0, b: 0, other: 0 },
    actions: (on) => ({
      bumpOther: on((s) => ({ other: s.other + 1 })),
      bumpA: on((s) => ({ a: s.a + 1 })),
    }),
  });
  const PairCtx = createContainerContext(pair);

  const run = (equals?: (a: unknown, b: unknown) => boolean) => {
    let renders = 0;
    let actions!: ReturnType<typeof PairCtx.useActions>;
    function Reader() {
      actions = PairCtx.useActions();
      PairCtx.useSelect((s) => ({ a: s.a.value, b: s.b.value }), equals);
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

  it("without equals, a new object re-renders on any dependency change", () => {
    const r = run();
    const before = r.renders();
    act(() => r.actions.bumpA());
    expect(r.renders()).toBeGreaterThan(before);
  });

  it("with shallow, an unrelated change does not re-render", () => {
    const r = run(shallow as (a: unknown, b: unknown) => boolean);
    const before = r.renders();
    act(() => r.actions.bumpOther());
    expect(r.renders()).toBe(before);
    act(() => r.actions.bumpA());
    expect(r.renders()).toBe(before + 1);
  });
});
