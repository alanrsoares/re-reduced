import { createAction } from "../actions";
import { handleActions } from "../reducers";

describe("Reducers", () => {
  describe("handleActions", () => {
    it("should create a reducer that's able to reduce the actions assigned to it", () => {
      const actions = {
        adjust: createAction<number>("ADJUST"),
        decrement: createAction("DECREMENT"),
        increment: createAction("INCREMENT")
      };

      const reducer = handleActions<number>(
        [
          actions.increment.reduce(state => state + 1),
          actions.decrement.reduce(state => state - 1),
          actions.adjust.reduce((state, payload) => state + payload)
        ],
        0
      );

      expect(reducer(0, actions.increment())).toBe(1);
      expect(reducer(0, actions.decrement())).toBe(-1);
      expect(reducer(10, actions.adjust(-5))).toBe(5);
      expect(reducer(10, actions.adjust(5))).toBe(15);
    });
  });
});
