import {
  createAction,
  createActions,
  createAsyncAction,
  CreateActionsAPI
} from "../lib/actions";

describe("Actions", () => {
  describe("createAction", () => {
    it("should create an actionCreator function", () => {
      const sayHello = createAction<string>("SAY_HELLO");

      const action = sayHello("World");

      expect(action).toEqual({ type: "SAY_HELLO", payload: "World" });
    });

    it("should create an actionCreator with meta", () => {
      const sayHello = createAction<string, boolean>("SAY_HELLO");

      const action = sayHello("World", { meta: false });

      expect(action).toEqual({
        meta: false,
        payload: "World",
        type: "SAY_HELLO"
      });
    });

    it("should create an actionCreator with error flag", () => {
      const mockError = new Error("Yo! Something went wrong!");
      const handleError = createAction<Error>("HANDLE_ERROR");

      const action = handleError(mockError, { error: true });

      expect(action).toEqual({
        error: true,
        payload: mockError,
        type: "HANDLE_ERROR"
      });
    });
  });

  describe("createAsyncAction", () => {
    it("should create a group of actions to handle async flows", () => {
      interface Movie {
        id: string;
        title: string;
      }

      const fetchMovies = createAsyncAction<Movie[]>("FETCH", "MOVIES");

      expect(fetchMovies()).toEqual({ type: "MOVIES/FETCH" });
      expect(fetchMovies.request.type).toBe("MOVIES/FETCH_REQUEST");
      expect(fetchMovies.success.type).toBe("MOVIES/FETCH_SUCCESS");
      expect(fetchMovies.failure.type).toBe("MOVIES/FETCH_FAILURE");
    });

    it("should create a group of actions to handle async flows (CreateActionsAPI)", () => {
      interface Movie {
        id: string;
        title: string;
      }

      const fetchMovies = CreateActionsAPI.asyncAction()("FETCH", "MOVIES");

      expect(fetchMovies()).toEqual({ type: "MOVIES/FETCH" });
      expect(fetchMovies.request.type).toBe("MOVIES/FETCH_REQUEST");
      expect(fetchMovies.success.type).toBe("MOVIES/FETCH_SUCCESS");
      expect(fetchMovies.failure.type).toBe("MOVIES/FETCH_FAILURE");
    });
  });

  describe("createActions", () => {
    describe("with no namespace", () => {
      const actions = createActions(create => ({
        doSomething: create.action(),
        doSomethingElse: create.action(),
        doSomethingAsync: create.asyncAction()
      }));

      expect(typeof actions.doSomething).toBe("function");
      expect(actions.doSomething.type).toBe("DO_SOMETHING");
      expect(actions.doSomethingElse.type).toBe("DO_SOMETHING_ELSE");
      expect(actions.doSomethingAsync.type).toBe("DO_SOMETHING_ASYNC");
    });

    describe("with namespace", () => {
      const actions = createActions("FOOS", create => ({
        doSomething: create.action(),
        doSomethingElse: create.action(),
        doSomethingAsync: create.asyncAction()
      }));

      expect(typeof actions.doSomething).toBe("function");
      expect(actions.doSomething.type).toBe("FOOS/DO_SOMETHING");
      expect(actions.doSomethingElse.type).toBe("FOOS/DO_SOMETHING_ELSE");
      expect(actions.doSomethingAsync.type).toBe("FOOS/DO_SOMETHING_ASYNC");
      expect(actions.doSomethingAsync.request.type).toBe(
        "FOOS/DO_SOMETHING_ASYNC_REQUEST"
      );
    });
  });
});
