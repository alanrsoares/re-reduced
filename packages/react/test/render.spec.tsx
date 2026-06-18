import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import { cleanup, fireEvent, render } from "@testing-library/react";
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
