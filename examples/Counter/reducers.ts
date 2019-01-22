import { createReducer, combineReducers } from "../../src";

import actions from "./actions";
import { State } from "./types";

const INITIAL_STATE = 0;

export const counter = createReducer<number>(
  [
    actions.increment.reduce(state => state + 1),
    actions.decrement.reduce(state => state - 1),
    actions.adjust.reduce((state, payload) => state + payload)
  ],
  INITIAL_STATE
);

export default combineReducers<State>({
  counter
});
