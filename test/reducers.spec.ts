import {
  createAsyncAction,
  createActions,
  createAction,
} from "../src/lib/actions";

import {
  createReducer,
  match,
  composeReducers,
  foldP,
} from "../src/lib/reducers";

const add = (a: number) => (b: number) => a + b;

describe("Reducers", () => {
  describe("createReducer", () => {
    it("should create a reducer that's able to reduce the actions assigned to it", () => {
      const actions = createActions(create => ({
        adjust: create.action<number>(),
        decrement: create.action(),
        increment: create.action(),
      }));

      const INITIAL_STATE = 0;

      const reducer = createReducer<number>(
        [
          actions.increment.reduce(add(1)),
          actions.decrement.reduce(add(-1)),
          actions.adjust.foldP(add),
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
      const actions = createActions(create => ({
        adjust: create.action<number>(),
        decrement: create.action(),
        increment: create.action(),
      }));

      const INITIAL_STATE = 0;

      const reducer = createReducer<number>(
        [
          match(actions.increment, add(1)),
          match(actions.decrement, add(-1)),
          foldP(actions.adjust, add),
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

  describe("composeReducers", () => {
    it("should combine two or reducers of the same state", () => {
      const actions = createActions("COUNTER", create => ({
        adjust: create.action<number>(),
        decrement: create.action(),
        increment: create.action(),
      }));

      const INITIAL_STATE = 0;

      const reducerA = createReducer<number>(
        [match(actions.increment, add(1)), foldP(actions.adjust, add)],
        INITIAL_STATE
      );

      const reducerB = createReducer<number>(
        actions.decrement.reduce(a => a - 1),
        INITIAL_STATE
      );

      const reducer = composeReducers(reducerA, reducerB);

      expect(reducer(0, actions.increment())).toBe(1);
      expect(reducer(0, actions.decrement())).toBe(-1);
      expect(reducer(10, actions.adjust(-5))).toBe(5);
      expect(reducer(10, actions.adjust(5))).toBe(15);
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
