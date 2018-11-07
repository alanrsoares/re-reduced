import { createAction } from "../../src";

export default {
  adjust: createAction<number>("ADJUST"),
  decrement: createAction("DECREMENT"),
  increment: createAction("INCREMENT")
};
