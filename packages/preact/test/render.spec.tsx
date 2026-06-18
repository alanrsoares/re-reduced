/** @jsxImportSource preact */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import { cleanup, fireEvent, render } from "@testing-library/preact";
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
