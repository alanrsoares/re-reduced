import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { defineContainer } from "@re-reduced/core";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createContainerContext } from "../src";

const todos = defineContainer("todos", {
  state: { draft: "", items: [] as string[] },
  actions: (on) => ({
    draftChanged: on<string>((s, draft) => ({ ...s, draft })),
    addItem: on<string>((s, item) => ({ ...s, items: [...s.items, item] })),
  }),
  derive: (s) => ({ count: () => s.items.value.length }),
});

const Ctx = createContainerContext(todos);

const counts = { draft: 0, list: 0, total: 0, controls: 0 };

function DraftInput() {
  const { draft, draftChanged } = Ctx.useContainer();
  counts.draft += 1;
  return (
    <input
      data-testid="input"
      value={draft}
      onChange={(e) => draftChanged(e.target.value)}
    />
  );
}

function List() {
  const { items } = Ctx.useContainer();
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

function Total() {
  const { count } = Ctx.useContainer(); // derived slice
  counts.total += 1;
  return <span data-testid="total">{count}</span>;
}

function Controls() {
  const { addItem } = Ctx.useContainer();
  counts.controls += 1; // reads only an action → subscribes to nothing
  return (
    <button type="button" data-testid="add" onClick={() => addItem("x")}>
      add
    </button>
  );
}

const App = () => (
  <Ctx.Provider>
    <DraftInput />
    <List />
    <Total />
    <Controls />
  </Ctx.Provider>
);

describe("@re-reduced/react — destructured useContainer (real DOM)", () => {
  beforeEach(() => {
    counts.draft = 0;
    counts.list = 0;
    counts.total = 0;
    counts.controls = 0;
  });
  afterEach(cleanup);

  it("a draft keystroke re-renders only the input", () => {
    const { getByTestId } = render(<App />);
    const baseline = { ...counts };

    fireEvent.change(getByTestId("input"), { target: { value: "a" } });

    expect(counts.draft).toBe(baseline.draft + 1);
    expect(counts.list).toBe(baseline.list);
    expect(counts.total).toBe(baseline.total);
    expect(counts.controls).toBe(baseline.controls);
    expect((getByTestId("input") as HTMLInputElement).value).toBe("a");
  });

  it("adding an item re-renders the list and the derived total, not the input", () => {
    const { getByTestId } = render(<App />);
    const baseline = { ...counts };

    fireEvent.click(getByTestId("add"));

    expect(counts.list).toBe(baseline.list + 1);
    expect(counts.total).toBe(baseline.total + 1); // count derived from items
    expect(counts.draft).toBe(baseline.draft); // input did NOT
    expect(counts.controls).toBe(baseline.controls); // action-only did NOT
    expect(getByTestId("total").textContent).toBe("1");
    expect(getByTestId("list").querySelectorAll("li").length).toBe(1);
  });
});
