import { combineReducers } from "redux";

import { createReducer } from "../../src";

import actions from "./actions";
import { State } from "./types";

const add = (a: number) => (b: number) => a + b;

const INITIAL_STATE = 0;

export const counter = createReducer<number>(
  [
    actions.increment.reduce(add(1)),
    actions.decrement.reduce(add(-1)),
    actions.adjust.foldP(add),
  ],
  INITIAL_STATE
);

export default combineReducers<State>({
  counter,
});
