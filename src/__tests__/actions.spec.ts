import { createAction } from "../actions";

describe("Actions", () => {
  describe("createAction", () => {
    const actionCreator = createAction<string>("SAY_HELLO");

    const action = actionCreator("World");

    expect(action).toEqual({ type: "SAY_HELLO", payload: "World" });
  });
});
