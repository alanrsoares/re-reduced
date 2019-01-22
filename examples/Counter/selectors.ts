import { createSelector } from "../../src";

import { State } from "./types";

export const getCounter = (state: State) => state.counter;

export const getCounterIsOdd = createSelector(
  getCounter,
  counter => counter % 2 !== 0
);

export const getCounterIsPositive = createSelector(
  getCounter,
  counter => counter >= 0
);
