import { createAction, createAsyncAction } from "../actions";

describe("Actions", () => {
  describe("createAction", () => {
    it("should create an actionCreator function", () => {
      const actionCreator = createAction<string>("SAY_HELLO");

      const action = actionCreator("World");

      expect(action).toEqual({ type: "SAY_HELLO", payload: "World" });
    });

    it("should create an actionCreator with meta", () => {
      const actionCreator = createAction<string, boolean>("SAY_HELLO");

      const action = actionCreator("World", false);

      expect(action).toEqual({
        meta: false,
        payload: "World",
        type: "SAY_HELLO"
      });
    });
  });

  describe("createAsyncAction", () => {
    it("should create a group of actions to handle async flows", () => {
      interface Movie {
        id: string;
        title: string;
      }

      const fetchMovies = createAsyncAction<void, Movie[]>("FETCH", "MOVIES");

      expect(fetchMovies()).toEqual({ type: "MOVIES/FETCH" });
      expect(fetchMovies.request.type).toBe("MOVIES/FETCH_REQUEST");
      expect(fetchMovies.success.type).toBe("MOVIES/FETCH_SUCCESS");
      expect(fetchMovies.failure.type).toBe("MOVIES/FETCH_FAILURE");
    });
  });
});
