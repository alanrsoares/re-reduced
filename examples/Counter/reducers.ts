import { combineReducers } from "redux";
import add from "ramda/src/add";

import { createReducer } from "../../src";

import actions from "./actions";
import { State } from "./types";

const INITIAL_STATE = 0;

export const counter = createReducer<number>(
  [
    actions.increment.reduce(add(1)),
    actions.decrement.reduce(add(-1)),
    actions.adjust.fold(payload => add(payload)),
  ],
  INITIAL_STATE
);

export default combineReducers<State>({
  counter,
});
