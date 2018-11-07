import { handleActions } from "../../src";

import actions from "./actions";

const INITIAL_STATE = 0;

export default handleActions<number>(
  [
    actions.increment.reduce(state => state + 1),
    actions.decrement.reduce(state => state - 1),
    actions.adjust.reduce((state, payload) => state + payload)
  ],
  INITIAL_STATE
);
