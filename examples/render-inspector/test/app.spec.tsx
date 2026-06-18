import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { App } from "../src/App";

afterEach(cleanup);

/** Sum each cell's own cumulative render count (written to `data-r`) for a grid. */
const renders = (grid: Element) =>
  Array.from(grid.querySelectorAll<HTMLElement>(".ri-cell")).reduce(
    (sum, el) => sum + Number(el.dataset.r ?? 0),
    0,
  );

const button = (root: HTMLElement, text: string): HTMLButtonElement => {
  const el = Array.from(root.querySelectorAll("button")).find(
    (b) => b.textContent === text,
  );
  if (!el) throw new Error(`no button "${text}"`);
  return el;
};

/**
 * The thesis, as a test: paint ONE cell and both backends update it, but
 * re-reduced re-renders ~1 cell while useReducer+Context re-renders the whole
 * grid (broadcast). Asserted on per-cell render counts (data-r), not the
 * intentionally-lagging summary badge.
 */
test("painting one cell re-renders far fewer cells with re-reduced", () => {
  const { container } = render(<App />);
  const [rrGrid, ctxGrid] = container.querySelectorAll(".ri-grid");

  // deterministic baseline: empty board
  fireEvent.click(button(container, "✕ Clear"));
  const rrBefore = renders(rrGrid);
  const ctxBefore = renders(ctxGrid);

  // paint the first cell of the re-reduced grid
  const firstCell = rrGrid.querySelector(".ri-cell");
  if (!firstCell) throw new Error("no cells rendered");
  fireEvent.pointerDown(firstCell);

  const rrDelta = renders(rrGrid) - rrBefore;
  const ctxDelta = renders(ctxGrid) - ctxBefore;

  expect(rrDelta).toBeGreaterThan(0); // the painted cell re-rendered
  expect(rrDelta).toBeLessThan(10); // …and essentially nothing else
  expect(ctxDelta).toBeGreaterThan(rrDelta * 10); // Context re-rendered the grid
});
