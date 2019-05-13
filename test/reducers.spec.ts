import {
  createAsyncAction,
  createActions,
  createAction,
} from "../src/lib/actions";
import { createReducer, match } from "../src/lib/reducers";

describe("Reducers", () => {
  describe("createReducer", () => {
    it("should create a reducer that's able to reduce the actions assigned to it", () => {
      const actions = createActions("COUNTER", create => ({
        adjust: create.action<number>(),
        decrement: create.action(),
        increment: create.action(),
      }));

      const INITIAL_STATE = 0;

      const add = (a: number, b: number) => a + b;

      const reducer = createReducer<number>(
        [
          actions.increment.reduce(state => state + 1),
          actions.decrement.reduce(state => state - 1),
          actions.adjust.fold(add),
        ],
        INITIAL_STATE
      );

      expect(reducer(0, actions.increment())).toBe(1);
      expect(reducer(0, actions.decrement())).toBe(-1);
      expect(reducer(10, actions.adjust(-5))).toBe(5);
      expect(reducer(10, actions.adjust(5))).toBe(15);
      expect(reducer(10, { type: "INVALID_ACTION" })).toBe(10);
    });

    it("should create a reducer that's able to reduce the actions assigned to it (using match)", () => {
      const actions = createActions("COUNTER", create => ({
        adjust: create.action<number>(),
        decrement: create.action(),
        increment: create.action(),
      }));

      const INITIAL_STATE = 0;

      const reducer = createReducer<number>(
        [
          match(actions.increment, state => state + 1),
          match(actions.decrement, state => state - 1),
          match(actions.adjust, (state, payload) => state + payload),
        ],
        INITIAL_STATE
      );

      expect(reducer(undefined, actions.increment())).toBe(1);
      expect(reducer(0, actions.increment())).toBe(1);
      expect(reducer(0, actions.decrement())).toBe(-1);
      expect(reducer(10, actions.adjust(-5))).toBe(5);
      expect(reducer(10, actions.adjust(5))).toBe(15);
    });

    it("should create a reducer that handles a single action", () => {
      const action = createAction("FOO");

      const INITIAL_STATE = "FOO";

      const reducer = createReducer<string>(
        match(action, () => "BAR"),
        INITIAL_STATE
      );

      expect(reducer(undefined, action)).toBe("BAR");
    });
  });

  describe("match", () => {
    it("creates a reducer with matchers that can handle multiple actions combined", () => {
      const action = createAsyncAction("FETCH_SOMETHING");
      const reducer = createReducer(
        [
          match(action.request, () => true),
          match([action.success, action.failure], () => false),
        ],
        false
      );

      expect(reducer(false, action.request())).toBe(true);
      expect(reducer(true, action.success({}))).toBe(false);
      expect(reducer(true, action.failure(new Error("foo")))).toBe(false);
    });
  });
});
