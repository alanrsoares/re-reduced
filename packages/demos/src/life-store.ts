/**
 * Conway's Game of Life — the write/read-heavy demo that makes re-reduced's
 * fine-grained reactivity tangible. Every tick rewrites the whole board, but
 * only a handful of cells actually flip. Two backends, identical board shape:
 *
 *  - re-reduced: ONE signal per cell. A tick dispatches a full next-generation
 *    state; the shallow diff writes only the cells that changed, so only those
 *    cells' subscribers re-render. On a typical board that's a few dozen DOM
 *    updates out of ~900.
 *  - useReducer + Context: ONE state object behind a Context. Any change is a
 *    new reference, so every one of the ~900 cell consumers re-renders every
 *    tick — even the cells that didn't change.
 *
 * Honesty note: the re-reduced tick is O(cells) (snapshot + diff — see the
 * `bench/` scaling probe). In a browser that JS cost (~tens of µs) is dwarfed
 * by the DOM commit it avoids, which is why the rr board stays smooth while the
 * Context board janks at speed.
 */
import { type ActionSpec, defineContainer, type Store } from "@re-reduced/core";

export const ROWS = 30;
export const COLS = 30;
export const CELL_COUNT = ROWS * COLS;

/** Flat index → state key. Cells are fields `c0`…`c899`, values 0 | 1. */
export const cellKey = (i: number) => `c${i}`;
export const CELL_KEYS = Array.from({ length: CELL_COUNT }, (_, i) =>
  cellKey(i),
);

export type LifeState = Record<string, number>;

export const emptyBoard = (): LifeState => {
  const state: LifeState = {};
  for (const key of CELL_KEYS) state[key] = 0;
  return state;
};

/** Seed ~`density` fraction of cells alive. `rand` injected so callers control RNG. */
export const randomBoard = (density: number, rand: () => number): LifeState => {
  const state: LifeState = {};
  for (const key of CELL_KEYS) state[key] = rand() < density ? 1 : 0;
  return state;
};

/** Toroidal next generation — standard B3/S23 rules, wrapping at the edges. */
export const nextGeneration = (s: LifeState): LifeState => {
  const next: LifeState = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let alive = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + ROWS) % ROWS;
          const nc = (c + dc + COLS) % COLS;
          alive += s[cellKey(nr * COLS + nc)];
        }
      }
      const i = cellKey(r * COLS + c);
      const live = s[i] === 1;
      next[i] = (live ? alive === 2 || alive === 3 : alive === 3) ? 1 : 0;
    }
  }
  return next;
};

export const population = (s: LifeState): number => {
  let n = 0;
  for (const key of CELL_KEYS) n += s[key];
  return n;
};

/** Mutable tally of how often the `population` derivation actually recomputed. */
export type RecomputeCounter = { count: number };

/** The re-reduced container: one signal per cell + a memoized `population`. */
export const defineLife = (rc: RecomputeCounter) =>
  defineContainer("life", {
    state: emptyBoard(),
    actions: (on) => ({
      setCell: on((s, p: { i: number; v: number }) => ({
        ...s,
        [cellKey(p.i)]: p.v,
      })),
      tick: on((s) => nextGeneration(s)),
      load: on((_s, board: LifeState) => board),
      clear: on(() => emptyBoard()),
    }),
    derive: ($) => ({
      population: () => {
        rc.count += 1;
        return CELL_KEYS.reduce((sum, key) => sum + $[key].value, 0);
      },
    }),
  });

/** Concrete store type so the React view can type cell props without `any`. */
export type LifeActions = {
  setCell: ActionSpec<LifeState, { i: number; v: number }>;
  tick: ActionSpec<LifeState, void>;
  load: ActionSpec<LifeState, LifeState>;
  clear: ActionSpec<LifeState, void>;
};
export type LifeDerived = { population: () => number };
export type LifeStore = Store<LifeState, LifeActions, LifeDerived>;

// ── naive useReducer + Context backend (same board, no fine-grained reads) ──
export type LifeAction =
  | { type: "setCell"; i: number; v: number }
  | { type: "tick" }
  | { type: "load"; board: LifeState }
  | { type: "clear" };

export const lifeReducer = (s: LifeState, a: LifeAction): LifeState => {
  switch (a.type) {
    case "setCell":
      return { ...s, [cellKey(a.i)]: a.v };
    case "tick":
      return nextGeneration(s);
    case "load":
      return a.board;
    case "clear":
      return emptyBoard();
  }
};
