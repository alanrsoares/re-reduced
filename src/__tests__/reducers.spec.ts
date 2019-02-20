import { createAction, createAsyncAction } from "../actions";
import {
  createReducer,
  createReducerFactory,
  reducerConfig
} from "../reducers";
import { AsyncAction } from "../core";

describe("Reducers", () => {
  describe("createReducer", () => {
    it("should create a reducer that's able to reduce the actions assigned to it", () => {
      const actions = {
        adjust: createAction<number>("ADJUST"),
        decrement: createAction<void>("DECREMENT"),
        increment: createAction<void>("INCREMENT")
      };

      const reducer = createReducer<number>(
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

  describe("createReducerFactory", () => {
    it("should create a reducer factory from a specification", () => {
      const myActions = {
        fetch: createAsyncAction<any[]>("FETCH_SOME_DATA_ASYNC")
      };

      const asyncActionMonitorReducerFactory = createReducerFactory<
        AsyncAction<any, any>,
        boolean
      >(
        ({ actions }) => ({
          [actions.request.type]: () => true,
          [actions.success.type]: () => false,
          [actions.failure.type]: () => false
        }),
        false
      );

      const config = reducerConfig({ actions: myActions.fetch });
      const reducer = asyncActionMonitorReducerFactory(config);

      expect(reducer(false, myActions.fetch.request())).toBe(true);
      expect(reducer(true, myActions.fetch.success([]))).toBe(false);
      expect(reducer(true, myActions.fetch.failure(new Error()))).toBe(false);
    });
  });
});
