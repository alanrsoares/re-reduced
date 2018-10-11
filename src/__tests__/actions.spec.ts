import { createAction, createAsyncActions } from "../actions";

describe("Actions", () => {
  describe("createAction", () => {
    it("should create an actionCreator function", () => {
      const actionCreator = createAction<string>("SAY_HELLO");

      const action = actionCreator("World");

      expect(action).toEqual({ type: "SAY_HELLO", payload: "World" });
    });
  });

  describe("createAsyncActions", () => {
    it("should create a group of actions to handle async flows", () => {
      interface Movie {
        id: string;
        title: string;
      }

      const fetchMovies = createAsyncActions<void, Movie[]>("FETCH", "MOVIES");

      expect(fetchMovies()).toEqual({ type: "MOVIES/FETCH" });
      expect(fetchMovies.request.type).toBe("MOVIES/FETCH_REQUEST");
      expect(fetchMovies.success.type).toBe("MOVIES/FETCH_SUCCESS");
      expect(fetchMovies.failure.type).toBe("MOVIES/FETCH_FAILURE");
    });
  });
});
